; ═══════════════════════════════════════════════════════
;  ROM Scraper — Custom NSIS Installer Script
;  Ryan's Outdoor Media
; ═══════════════════════════════════════════════════════

!macro customHeader
  !system "echo '' > ${BUILD_RESOURCES_DIR}/customHeader"
!macroend

!macro customInit
!macroend

!macro customInstall
  ; Create desktop shortcut with custom icon
  CreateShortCut "$DESKTOP\ROM Scraper.lnk" "$INSTDIR\ROM Scraper.exe" "" "$INSTDIR\ROM Scraper.exe" 0

  ; Write install info to registry for Add/Remove Programs
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ROM Scraper" \
    "DisplayName" "ROM Scraper"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ROM Scraper" \
    "Publisher" "Ryan's Outdoor Media"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ROM Scraper" \
    "DisplayVersion" "1.0.0"
  WriteRegStr HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ROM Scraper" \
    "URLInfoAbout" "https://github.com/Alucrob/Rom-Scraper"
!macroend

!macro customUnInstall
  ; Clean up registry on uninstall
  DeleteRegKey HKLM "Software\Microsoft\Windows\CurrentVersion\Uninstall\ROM Scraper"
  ; Remove desktop shortcut
  Delete "$DESKTOP\ROM Scraper.lnk"
!macroend
