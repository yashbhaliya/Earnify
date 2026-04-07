$f = 'c:\Users\Admin\Downloads\Earnify\public\admin\Profile\index.html'
$c = [System.IO.File]::ReadAllText($f)
$old = "  </style>`r`n`r`n`r`n  <script src=`"../admin-dark.js`"></script>`r`n`r`n  <div class=`"sidebar-overlay`""
$new = "  </style>`r`n`r`n</head>`r`n<body>`r`n<script src=`"../admin-dark.js`"></script>`r`n`r`n  <div class=`"sidebar-overlay`""
$c = $c.Replace($old, $new)
[System.IO.File]::WriteAllText($f, $c)
Write-Host "Done. Replaced: $($c.Contains('</head>'))"
