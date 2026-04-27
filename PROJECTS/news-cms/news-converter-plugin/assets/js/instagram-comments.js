(function($) {
    'use strict';

    $(document).ready(function() {
        // Guardar configuración
        $('#nc-instagram-settings-form').on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $spinner = $form.find('.spinner');
            var $message = $('#settings-message');

            $spinner.addClass('is-active');
            $message.html('');

            $.ajax({
                url: ncInstagram.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'nc_instagram_save_settings',
                    nonce: ncInstagram.nonce,
                    access_token: $('#access_token').val(),
                    instagram_account_id: $('#instagram_account_id').val(),
                    page_id: $('#page_id').val()
                },
                success: function(response) {
                    $spinner.removeClass('is-active');
                    if (response.success) {
                        $message.html('<div class="notice notice-success"><p>' + response.data + '</p></div>');
                    } else {
                        $message.html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
                    }
                },
                error: function() {
                    $spinner.removeClass('is-active');
                    $message.html('<div class="notice notice-error"><p>Error de conexión</p></div>');
                }
            });
        });

        // Descargar comentarios
        $('#nc-instagram-download-form').on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $spinner = $form.find('.spinner');
            var $progress = $('#download-progress');
            var $results = $('#download-results');
            var $links = $('#download-links');

            $spinner.addClass('is-active');
            $progress.show();
            $results.hide();
            $links.html('');

            $('.nc-progress-fill').css('width', '30%');
            $('.nc-progress-status').text('Obteniendo posts...');

            $.ajax({
                url: ncInstagram.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'nc_instagram_download',
                    nonce: ncInstagram.nonce,
                    limit: $('#limit').val(),
                    since: $('#since').val(),
                    until: $('#until').val(),
                    format: $('#format').val(),
                    include_replies: $('#include_replies').is(':checked') ? 'true' : 'false'
                },
                success: function(response) {
                    $spinner.removeClass('is-active');
                    $('.nc-progress-fill').css('width', '100%');
                    $('.nc-progress-status').text('Completado');

                    if (response.success) {
                        var stats = response.data.stats;
                        var files = response.data.files;

                        $('#stat-total').text(stats.total_comments.toLocaleString());
                        $('#stat-replies').text(stats.total_replies.toLocaleString());
                        $('#stat-users').text(stats.unique_users.toLocaleString());
                        $('#stat-posts').text(stats.posts_processed.toLocaleString());

                        $results.show();

                        // Mostrar enlaces de descarga
                        if (files.json) {
                            $links.append(
                                '<a href="' + files.json.url + '" class="button" download>' +
                                '<span class="dashicons dashicons-media-document" style="line-height: 1.5;"></span> ' +
                                'Descargar JSON (' + files.json.count + ' registros)</a>'
                            );
                        }

                        if (files.csv) {
                            $links.append(
                                '<a href="' + files.csv.url + '" class="button" download>' +
                                '<span class="dashicons dashicons-media-spreadsheet" style="line-height: 1.5;"></span> ' +
                                'Descargar CSV (' + files.csv.count + ' registros)</a>'
                            );
                        }

                        // Mostrar errores si los hay
                        if (response.data.errors && response.data.errors.length > 0) {
                            var errorHtml = '<div class="notice notice-warning" style="margin-top: 15px;">' +
                                '<p><strong>Advertencias:</strong></p><ul>';
                            response.data.errors.forEach(function(error) {
                                errorHtml += '<li>' + error.message + '</li>';
                            });
                            errorHtml += '</ul></div>';
                            $links.append(errorHtml);
                        }
                    } else {
                        $('.nc-progress-status').text('Error');
                        $links.html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
                    }
                },
                error: function(xhr, status, error) {
                    $spinner.removeClass('is-active');
                    $('.nc-progress-fill').css('width', '100%').css('background', '#d63638');
                    $('.nc-progress-status').text('Error de conexión');
                    $links.html('<div class="notice notice-error"><p>Error: ' + error + '</p></div>');
                }
            });
        });

        // Scraper público
        $('#nc-instagram-scraper-form').on('submit', function(e) {
            e.preventDefault();

            var $form = $(this);
            var $spinner = $form.find('.spinner');
            var $progress = $('#scraper-progress');
            var $results = $('#scraper-results');
            var $links = $('#scraper-links');

            $spinner.addClass('is-active');
            $progress.show();
            $results.hide();
            $links.html('');

            $('.nc-progress-fill').css('width', '10%');
            $('.nc-progress-status').text('Conectando con Instagram...');

            $.ajax({
                url: ncInstagram.ajaxUrl,
                type: 'POST',
                data: {
                    action: 'nc_instagram_scrape',
                    nonce: ncInstagram.nonce,
                    url: $('#scraper_url').val(),
                    posts: $('#scraper_posts').val(),
                    comments: $('#scraper_comments').val(),
                    delay: $('#scraper_delay').val(),
                    format: $('#scraper_format').val(),
                    method: $('#scraper_method').val()
                },
                success: function(response) {
                    $spinner.removeClass('is-active');
                    $('.nc-progress-fill').css('width', '100%');
                    $('.nc-progress-status').text('Completado');

                    if (response.success) {
                        var stats = response.data.stats;
                        var files = response.data.files;

                        $('#scraper-stat-total').text(stats.total_comments.toLocaleString());
                        $('#scraper-stat-replies').text(stats.total_replies.toLocaleString());
                        $('#scraper-stat-users').text(stats.unique_users.toLocaleString());
                        $('#scraper-stat-posts').text(stats.posts_processed.toLocaleString());

                        $results.show();

                        // Mostrar enlaces de descarga
                        if (files.json) {
                            $links.append(
                                '<a href="' + files.json.url + '" class="button" download>' +
                                '<span class="dashicons dashicons-media-document" style="line-height: 1.5;"></span> ' +
                                'Descargar JSON (' + files.json.count + ' registros)</a> '
                            );
                        }

                        if (files.csv) {
                            $links.append(
                                '<a href="' + files.csv.url + '" class="button" download>' +
                                '<span class="dashicons dashicons-media-spreadsheet" style="line-height: 1.5;"></span> ' +
                                'Descargar CSV (' + files.csv.count + ' registros)</a> '
                            );
                        }

                        // Mostrar errores si los hay
                        if (response.data.errors && response.data.errors.length > 0) {
                            var errorHtml = '<div class="notice notice-warning" style="margin-top: 15px;">' +
                                '<p><strong>Advertencias:</strong></p><ul>';
                            response.data.errors.forEach(function(error) {
                                errorHtml += '<li>' + error.message + '</li>';
                            });
                            errorHtml += '</ul></div>';
                            $links.append(errorHtml);
                        }
                    } else {
                        $('.nc-progress-status').text('Error');
                        $links.html('<div class="notice notice-error"><p>' + response.data + '</p></div>');
                    }
                },
                error: function(xhr, status, error) {
                    $spinner.removeClass('is-active');
                    $('.nc-progress-fill').css('width', '100%').css('background', '#d63638');
                    $('.nc-progress-status').text('Error de conexión');
                    $links.html('<div class="notice notice-error"><p>Error: ' + error + '</p></div>');
                }
            });
        });
    });

})(jQuery);
