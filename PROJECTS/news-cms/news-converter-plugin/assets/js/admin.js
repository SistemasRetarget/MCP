(function ($) {
    'use strict';

    let currentData = null;
    let tags = [];
    let aiOriginal = { title: '', excerpt: '', content: '', author: '' };
    let originalImageUrl = '';

    function showError(msg) {
        $('#ncError').text(msg).addClass('active');
        $('#ncSuccess').removeClass('active');
    }

    function showSuccess(msg) {
        $('#ncSuccess').text(msg).addClass('active');
        $('#ncError').removeClass('active');
    }

    function clearMessages() {
        $('#ncError, #ncSuccess').removeClass('active');
    }

    function renderTags() {
        const container = $('#ncTagsContainer');
        container.empty();
        tags.forEach(function (tag, index) {
            container.append(
                '<div class="nc-tag">' +
                    tag +
                    '<button type="button" data-index="' + index + '">×</button>' +
                '</div>'
            );
        });
    }

    function populatePreview(data) {
        $('#ncTitle').val(data.title || '');
        $('#ncExcerpt').val(data.excerpt || '');
        $('#ncAuthor').val(data.author || '');
        $('#ncContent').val(data.content || '');
        $('#ncImageUrl').val(data.image_url || '');

        aiOriginal = {
            title: data.title || '',
            excerpt: data.excerpt || '',
            content: data.content || '',
            author: data.author || ''
        };
        originalImageUrl = data.image_url || '';

        if (data.image_url) {
            $('#ncPreviewImage').attr('src', data.image_url).addClass('active');
        } else {
            $('#ncPreviewImage').removeClass('active');
        }

        if (data.category) {
            const catOption = $('#ncCategory option').filter(function () {
                return $(this).val() === data.category;
            });
            if (catOption.length) {
                $('#ncCategory').val(data.category);
            }
        }

        tags = data.tags || [];
        renderTags();

        const confidence = Math.round((data.confidence || 0.8) * 100);
        $('#ncConfidence').text('Confianza IA: ' + confidence + '%');

        $('#ncPreview').addClass('active');
    }

    function resetForm() {
        $('#ncUrl').val('');
        $('#ncPreview').removeClass('active');
        clearMessages();
        currentData = null;
        tags = [];
    }

    function publishPost(status) {
        const postData = {
            action: 'nc_publish_post',
            nonce: ncAjax.nonce,
            title: $('#ncTitle').val(),
            excerpt: $('#ncExcerpt').val(),
            content: $('#ncContent').val(),
            author_name: $('#ncAuthor').val(),
            category: $('#ncCategory').val() === '__new__' ? $('#ncNewCategory').val() : $('#ncCategory').val(),
            tags: tags,
            image_url: $('#ncImageUrl').val(),
            original_url: currentData ? currentData.original_url : '',
            post_status: status,
            ai_title: aiOriginal.title,
            ai_excerpt: aiOriginal.excerpt,
            ai_content: aiOriginal.content,
            ai_author: aiOriginal.author
        };

        $('#ncDraftBtn, #ncPublishBtn').prop('disabled', true);

        $.post(ncAjax.ajaxurl, postData, function (response) {
            if (response.success) {
                const statusText = status === 'draft' ? 'borrador' : 'publicado';
                showSuccess('✓ Post guardado como ' + statusText + '. ');

                const editLink = $('<a>')
                    .attr('href', response.data.edit_url)
                    .attr('target', '_blank')
                    .text('Editar post');
                $('#ncSuccess').append(' ').append(editLink);

                if (status === 'publish' && response.data.view_url) {
                    const viewLink = $('<a>')
                        .attr('href', response.data.view_url)
                        .attr('target', '_blank')
                        .text(' | Ver post');
                    $('#ncSuccess').append(viewLink);
                }
            } else {
                showError('Error: ' + response.data);
            }
        }).fail(function () {
            showError('Error de conexión');
        }).always(function () {
            $('#ncDraftBtn, #ncPublishBtn').prop('disabled', false);
        });
    }

    $(document).ready(function () {

        $('#ncConvertBtn').on('click', function () {
            const url = $('#ncUrl').val().trim();
            clearMessages();

            if (!url) {
                showError('Por favor ingresa una URL válida');
                return;
            }

            $(this).prop('disabled', true);
            $('#ncLoading').addClass('active');

            $.post(ncAjax.ajaxurl, {
                action: 'nc_convert_url',
                nonce: ncAjax.nonce,
                url: url
            }, function (response) {
                if (response.success) {
                    currentData = response.data;
                    populatePreview(response.data);
                    showSuccess('✓ Contenido extraído y analizado correctamente');
                } else {
                    showError('Error: ' + response.data);
                }
            }).fail(function () {
                showError('Error de conexión con el servidor');
            }).always(function () {
                $('#ncConvertBtn').prop('disabled', false);
                $('#ncLoading').removeClass('active');
            });
        });

        $('#ncUrl').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                $('#ncConvertBtn').trigger('click');
            }
        });

        $('#ncTagInput').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                const val = $(this).val().trim();
                if (val && tags.indexOf(val) === -1) {
                    tags.push(val);
                    $(this).val('');
                    renderTags();
                }
            }
        });

        $(document).on('click', '.nc-tag button', function () {
            const index = $(this).data('index');
            tags.splice(index, 1);
            renderTags();
        });

        $(document).on('click', '.nc-regen-btn', function () {
            const btn = $(this);
            const field = btn.data('field');

            if (field === 'image') {
                const imageUrl = $('#ncImageUrl').val();
                if (!imageUrl) { showError('No hay imagen'); return; }
                const originalText = btn.text();
                btn.addClass('loading').text('⏳...');
                $('#ncImageLoading').addClass('active');
                $.post(ncAjax.ajaxurl, {
                    action: 'nc_edit_image',
                    nonce: ncAjax.nonce,
                    image_url: imageUrl,
                    filter: 'sharpen'
                }, function (response) {
                    if (response.success) {
                        $('#ncImageUrl').val(response.data.image_url);
                        $('#ncPreviewImage').attr('src', response.data.image_url).addClass('active');
                    } else {
                        showError('Error: ' + response.data);
                    }
                }).fail(function () {
                    showError('Error de conexión');
                }).always(function () {
                    btn.removeClass('loading').text(originalText);
                    $('#ncImageLoading').removeClass('active');
                });
                return;
            }

            const fieldMap = {
                title: '#ncTitle',
                excerpt: '#ncExcerpt',
                author: '#ncAuthor',
                content: '#ncContent'
            };
            const input = $(fieldMap[field]);
            if (!input.length) return;

            const originalText = btn.text();
            btn.addClass('loading').text('⏳...');

            $.post(ncAjax.ajaxurl, {
                action: 'nc_regenerate_field',
                nonce: ncAjax.nonce,
                field: field,
                current_value: input.val(),
                context: $('#ncContent').val().substring(0, 500),
                original_title: currentData ? (currentData.extracted_raw ? currentData.extracted_raw.title : '') : ''
            }, function (response) {
                if (response.success) {
                    input.val(response.data.value);
                    input.css('background-color', '#f0fff0');
                    setTimeout(function () {
                        input.css('background-color', '');
                    }, 1500);
                } else {
                    showError('Error regenerando: ' + response.data);
                }
            }).fail(function () {
                showError('Error de conexión');
            }).always(function () {
                btn.removeClass('loading').text(originalText);
            });
        });

        $('#ncImageUrl').on('change', function () {
            const url = $(this).val();
            if (url) {
                $('#ncPreviewImage').attr('src', url).addClass('active');
            } else {
                $('#ncPreviewImage').removeClass('active');
            }
        });

        $('#ncCategory').on('change', function () {
            if ($(this).val() === '__new__') {
                $('#ncNewCategory').removeClass('nc-hidden').focus();
            } else {
                $('#ncNewCategory').addClass('nc-hidden');
            }
        });

        $(document).on('click', '.nc-filter-btn', function () {
            const btn = $(this);
            const filter = btn.data('filter');
            const imageUrl = $('#ncImageUrl').val();
            if (!imageUrl) { showError('No hay imagen para editar'); return; }

            btn.addClass('loading');
            $('#ncImageLoading').addClass('active');

            $.post(ncAjax.ajaxurl, {
                action: 'nc_edit_image',
                nonce: ncAjax.nonce,
                image_url: imageUrl,
                filter: filter
            }, function (response) {
                if (response.success) {
                    $('#ncImageUrl').val(response.data.image_url);
                    $('#ncPreviewImage').attr('src', response.data.image_url).addClass('active');
                } else {
                    showError('Error: ' + response.data);
                }
            }).fail(function () {
                showError('Error de conexión');
            }).always(function () {
                btn.removeClass('loading');
                $('#ncImageLoading').removeClass('active');
            });
        });

        $('#ncAddTextBtn').on('click', function () {
            const text = $('#ncOverlayText').val().trim();
            if (!text) { showError('Escribe el texto a agregar'); return; }
            const imageUrl = $('#ncImageUrl').val();
            if (!imageUrl) { showError('No hay imagen para editar'); return; }

            const btn = $(this);
            const originalText = btn.text();
            btn.addClass('loading').text('⏳...');
            $('#ncImageLoading').addClass('active');

            $.post(ncAjax.ajaxurl, {
                action: 'nc_edit_image',
                nonce: ncAjax.nonce,
                image_url: imageUrl,
                overlay_text: text
            }, function (response) {
                if (response.success) {
                    $('#ncImageUrl').val(response.data.image_url);
                    $('#ncPreviewImage').attr('src', response.data.image_url).addClass('active');
                } else {
                    showError('Error: ' + response.data);
                }
            }).fail(function () {
                showError('Error de conexión');
            }).always(function () {
                btn.removeClass('loading').text(originalText);
                $('#ncImageLoading').removeClass('active');
            });
        });

        $('#ncOverlayText').on('keypress', function (e) {
            if (e.which === 13) {
                e.preventDefault();
                $('#ncAddTextBtn').trigger('click');
            }
        });

        $('#ncRestoreImageBtn').on('click', function () {
            if (originalImageUrl) {
                $('#ncImageUrl').val(originalImageUrl);
                $('#ncPreviewImage').attr('src', originalImageUrl).addClass('active');
                showSuccess('Imagen original restaurada');
            }
        });

        $('#ncResetBtn').on('click', function () {
            resetForm();
        });

        $('#ncDraftBtn').on('click', function () {
            publishPost('draft');
        });

        $('#ncPublishBtn').on('click', function () {
            publishPost('publish');
        });
    });

})(jQuery);
