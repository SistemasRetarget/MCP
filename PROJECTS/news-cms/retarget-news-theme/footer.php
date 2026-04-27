<?php
/**
 * Footer del tema Retarget
 */
?>
</div><!-- .site-content -->

<footer class="site-footer">
    <div class="footer-container">
        
        <!-- Brand -->
        <div class="footer-brand">
            <h2 class="site-title"><?php bloginfo('name'); ?></h2>
            <p><?php bloginfo('description'); ?></p>
            <p>Tu portal de noticias actualizado 24/7 con información relevante de política, economía, deportes y cultura.</p>
        </div>
        
        <!-- Widget Footer 1 -->
        <?php if (is_active_sidebar('footer-1')) : ?>
            <?php dynamic_sidebar('footer-1'); ?>
        <?php else : ?>
            <div class="widget">
                <h4 class="footer-title">Secciones</h4>
                <ul class="footer-links">
                    <li><a href="#">Política</a></li>
                    <li><a href="#">Economía</a></li>
                    <li><a href="#">Deportes</a></li>
                    <li><a href="#">Tecnología</a></li>
                    <li><a href="#">Cultura</a></li>
                </ul>
            </div>
        <?php endif; ?>
        
        <!-- Widget Footer 2 -->
        <?php if (is_active_sidebar('footer-2')) : ?>
            <?php dynamic_sidebar('footer-2'); ?>
        <?php else : ?>
            <div class="widget">
                <h4 class="footer-title">Legal</h4>
                <ul class="footer-links">
                    <li><a href="#">Términos de uso</a></li>
                    <li><a href="#">Política de privacidad</a></li>
                    <li><a href="#">Contacto</a></li>
                    <li><a href="#">Trabaja con nosotros</a></li>
                </ul>
            </div>
        <?php endif; ?>
        
        <!-- Widget Footer 3 -->
        <?php if (is_active_sidebar('footer-3')) : ?>
            <?php dynamic_sidebar('footer-3'); ?>
        <?php else : ?>
            <div class="widget">
                <h4 class="footer-title">Síguenos</h4>
                <div class="social-widget">
                    <a href="#" class="facebook" aria-label="Facebook">f</a>
                    <a href="#" class="twitter" aria-label="Twitter">t</a>
                    <a href="#" class="instagram" aria-label="Instagram">i</a>
                    <a href="#" class="youtube" aria-label="YouTube">y</a>
                </div>
                <p style="margin-top: 20px; opacity: 0.8; font-size: 0.9em;">
                    Suscríbete a nuestro newsletter para recibir las noticias más importantes cada mañana.
                </p>
            </div>
        <?php endif; ?>
        
    </div>
    
    <div class="footer-bottom">
        <p>&copy; <?php echo date('Y'); ?> <?php bloginfo('name'); ?>. Todos los derechos reservados.</p>
    </div>
</footer>

<?php wp_footer(); ?>
</body>
</html>
