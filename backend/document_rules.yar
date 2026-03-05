/*
  Comprehensive ThreatGuard YARA Ruleset
  Category: PDF Exploits, Office Macros, RTF Structures, Fileless Malwares, Social Engineering
*/

// ==========================================
// 1. PDF EXPLOIT RULES
// ==========================================

rule PDF_Suspicious_Structural_Elements {
    meta:
        description = "Detects PDF elements often abused by exploits (OpenAction, JS, EmbeddedFiles, Launch)"
        author = "ThreatGuard"
        severity = "High"
    strings:
        $magic = "%PDF-"
        
        $js1 = "/JavaScript" nocase
        $js2 = "/JS" nocase
        $act1 = "/OpenAction" nocase
        $act2 = "/AA" nocase  // Additional Actions
        $launch = "/Launch" nocase
        $embed = "/EmbeddedFiles" nocase
        
        $hex_js = { 2F 4A 61 76 61 53 63 72 69 70 74 } // /JavaScript in hex
    condition:
        $magic at 0 and any of ($js*, $act*, $launch, $embed, $hex_js)
}

rule PDF_Exploit_JBIG2_Heap_Spray {
    meta:
        description = "Detects excessive JBIG2Decode streams often used for PDF heap sprays"
        author = "ThreatGuard"
        severity = "Critical"
    strings:
        $magic = "%PDF-"
        $jbig = "/JBIG2Decode"
    condition:
        $magic at 0 and #jbig > 3
}

// ==========================================
// 2. MICROSOFT OFFICE & VBA MACRO RULES
// ==========================================

rule Office_Suspicious_VBA_Keywords {
    meta:
        description = "Detects VBA projects executing dangerous external/API calls"
        author = "ThreatGuard"
        severity = "Critical"
    strings:
        // Execution & Process manipulation
        $api1 = "VirtualAlloc" ascii nocase
        $api2 = "WriteProcessMemory" ascii nocase
        $api3 = "CreateThread" ascii nocase
        $api4 = "ShellExecute" ascii nocase
        
        // Downloading
        $api5 = "URLDownloadToFile" ascii nocase
        $api6 = "XMLHTTP" ascii nocase
        $api7 = "Net.WebClient" ascii nocase
        
        // Persistence / Execution
        $exec1 = "WScript.Shell" ascii nocase
        $exec2 = "cmd.exe" ascii nocase
        $exec3 = "powershell.exe" ascii nocase
        
        // Auto execution hooks
        $hook1 = "AutoOpen" ascii nocase
        $hook2 = "Document_Open" ascii nocase
        $hook3 = "Workbook_Open" ascii nocase
    condition:
        any of ($hook*) and any of ($api*, $exec*)
}

rule Office_CVE_2017_11882_Equation_Editor {
    meta:
        description = "Detects malicious Equation Editor OLE objects (CVE-2017-11882)"
        author = "ThreatGuard"
        severity = "Critical"
    strings:
        $ole = "\\x01OLE10Native" ascii
        $eq = "Equation Native" ascii nocase
        $font_abuse = "font" ascii nocase
    condition:
        $ole and ($eq or $font_abuse)
}

rule Office_Excel4_Macro_Execution {
    meta:
        description = "Detects Excel 4.0 (XLM) macro evasion techniques"
        author = "ThreatGuard"
        severity = "High"
    strings:
        $xlm1 = "EXEC(" ascii nocase
        $xlm2 = "HALT()" ascii nocase
        $xlm3 = "CALL(" ascii nocase
        $xlm4 = "REGISTER(" ascii nocase
        $auto = "Auto_Open" ascii nocase
    condition:
        ($xlm1 or $xlm2 or $xlm3 or $xlm4) and $auto
}

// ==========================================
// 3. RTF & EMBEDDED OLE EXPLOITS
// ==========================================

rule RTF_Suspicious_Embedded_Object {
    meta:
        description = "Detects RTF documents attempting to force execution of embedded OLE objects"
        author = "ThreatGuard"
        severity = "High"
    strings:
        $magic = "{\\rtf"
        
        $obj1 = "\\objdata"
        $obj2 = "\\objupdate" // Forces update/execution without user interaction
        $obj3 = "\\objautlink"
        $exe_hex = "4d5a" nocase // MZ header in ascii hex
    condition:
        $magic at 0 and ($obj1 and ($obj2 or $obj3 or $exe_hex))
}

// ==========================================
// 4. FILELESS MALWARE & SCRIPTING
// ==========================================

rule Script_Obfuscated_Powershell {
    meta:
        description = "Detects obfuscated or hidden Powershell execution arguments"
        author = "ThreatGuard"
        severity = "Critical"
    strings:
        $ps = "powershell" ascii nocase wide
        
        $arg1 = "-enc" nocase
        $arg2 = "-EncodedCommand" nocase
        $arg3 = "-w hidden" nocase
        $arg4 = "-WindowStyle hidden" nocase
        $arg5 = "-ep bypass" nocase
        $arg6 = "-ExecutionPolicy bypass" nocase
        $arg7 = "-nop" nocase
        
        $iex = "IEX" nocase
        $invoke = "Invoke-Expression" nocase
    condition:
        $ps and (any of ($arg*) or $iex or $invoke)
}

rule Generic_Hex_Encoded_Shellcode {
    meta:
        description = "Detects common hex-encoded NOP sleds or shellcode instructions"
        author = "ThreatGuard"
        severity = "Medium"
    strings:
        $nop1 = "\\x90\\x90\\x90\\x90"
        $nop2 = "%90%90%90%90"
        $hex1 = "\\x"
    condition:
        ($nop1 or $nop2) or (#hex1 > 50)
}

// ==========================================
// 5. PHISHING & CREDENTIAL HARVESTING
// ==========================================

rule Phishing_Banking_Credentials {
    meta:
        description = "Comprehensive list of terminology used in bank and account phishing"
        author = "ThreatGuard"
        severity = "High"
    strings:
        // Account threats
        $t1 = "temporarily suspended account" nocase wide ascii
        $t2 = "permanently closed" nocase wide ascii
        $t3 = "unusual activity on your account" nocase wide ascii
        $t4 = "unauthorized access detected" nocase wide ascii
        
        // Actions
        $a1 = "restore access" nocase wide ascii
        $a2 = "confirm your identity" nocase wide ascii
        $a3 = "verify your account" nocase wide ascii
        $a4 = "login to continue" nocase wide ascii
        $a5 = "update your billing" nocase wide ascii
        $a6 = "click here to secure" nocase wide ascii
        $a7 = "password reset" nocase wide ascii
        
        // Service spoofing
        $s1 = "Dear Valued Customer" nocase wide ascii
        $s2 = "IMPORTANT NOTICE FROM" nocase wide ascii
    condition:
        3 of them
}

rule Suspicious_URL_Shorteners {
    meta:
        description = "Detects obfuscated links common in phishing emails/docs"
        author = "ThreatGuard"
        severity = "Medium"
    strings:
        $l1 = "bit.ly/" ascii nocase
        $l2 = "tinyurl.com/" ascii nocase
        $l3 = "goo.gl/" ascii nocase
        $l4 = "ngrok.io" ascii nocase
        $l5 = "ow.ly/" ascii nocase
        $l6 = "t.co/" ascii nocase
    condition:
        any of them
}

// ==========================================
// 6. RANSOMWARE HEURISTICS
// ==========================================

rule Ransomware_Note_Heuristics {
    meta:
        description = "Detects terminology from standard ransomware extortion notes"
        author = "ThreatGuard"
        severity = "Critical"
    strings:
        $r1 = "files have been encrypted" nocase ascii wide
        $r2 = "military-grade" nocase ascii wide
        $r3 = "AES-256" nocase ascii wide
        $r4 = "RSA-2048" nocase ascii wide
        $r5 = "Purchase Bitcoin" nocase ascii wide
        $r6 = "decrypt files yourself" nocase ascii wide
        $r7 = "unique private key" nocase ascii wide
        $r8 = "permanently deleted" nocase ascii wide
        $r9 = "What happened to your files" nocase ascii wide
        $r10 = ".locked" nocase ascii wide
        $r11 = ".onion" nocase ascii wide // Tor links
    condition:
        3 of them
}
