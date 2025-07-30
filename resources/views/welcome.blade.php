<!DOCTYPE html>
<html lang="{{ str_replace('_', '-', app()->getLocale()) }}">
    <head>
        <meta charset="utf-8">
        <meta name="viewport" content="width=device-width, initial-scale=1">

        <title>Inorbvict</title>
        @vite(['resources/js/index.tsx', 'resources/css/scss/theme.scss', 'resources/css/scss/user.scss'])
    </head>
    <body>
        <div id="root"></div>
    </body>
</html>
