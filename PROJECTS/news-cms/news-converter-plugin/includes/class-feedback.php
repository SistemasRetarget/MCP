<?php
if ( ! defined( 'ABSPATH' ) ) {
    exit;
}

class NC_Feedback {

    const OPTION_KEY = 'nc_editor_feedback';
    const MAX_ENTRIES = 30;

    public static function save( $field, $ai_value, $editor_value ) {
        if ( trim( $ai_value ) === trim( $editor_value ) ) {
            return;
        }

        $feedback = get_option( self::OPTION_KEY, array() );

        $feedback[] = array(
            'field'        => $field,
            'ai_said'      => $ai_value,
            'editor_chose' => $editor_value,
            'date'         => current_time( 'mysql' ),
        );

        if ( count( $feedback ) > self::MAX_ENTRIES ) {
            $feedback = array_slice( $feedback, -self::MAX_ENTRIES );
        }

        update_option( self::OPTION_KEY, $feedback );
    }

    public static function get_lessons( $field = '', $limit = 10 ) {
        $feedback = get_option( self::OPTION_KEY, array() );

        if ( ! empty( $field ) ) {
            $feedback = array_filter( $feedback, function( $entry ) use ( $field ) {
                return $entry['field'] === $field;
            });
        }

        return array_slice( array_reverse( $feedback ), 0, $limit );
    }

    public static function format_lessons_for_prompt( $field, $limit = 5 ) {
        $lessons = self::get_lessons( $field, $limit );

        if ( empty( $lessons ) ) {
            return '';
        }

        $text = "\n\nAPRENDIZAJE DEL EDITOR - El editor ha corregido tus sugerencias anteriores. Aprende de estos ejemplos:\n";

        foreach ( $lessons as $i => $lesson ) {
            $num = $i + 1;
            $text .= "\nCorrección {$num}:\n";
            $text .= "- IA sugirió: \"{$lesson['ai_said']}\"\n";
            $text .= "- Editor prefirió: \"{$lesson['editor_chose']}\"\n";
        }

        $text .= "\nUsa estas correcciones para entender el ESTILO que prefiere el editor y aplícalo a las nuevas generaciones.\n";

        return $text;
    }

    public static function get_all() {
        return get_option( self::OPTION_KEY, array() );
    }

    public static function clear() {
        delete_option( self::OPTION_KEY );
    }
}
