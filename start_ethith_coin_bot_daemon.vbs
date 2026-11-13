Set WshShell = CreateObject("WScript.Shell")
WshShell.CurrentDirectory = "C:\Users\Admin\Desktop\ETHITH TEST"
WshShell.Run "node ethith_admin_bot.js", 0, False
