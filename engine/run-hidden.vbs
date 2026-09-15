' Run a console program with no window, and exit with its exit code.
'
' Operator, 2026-09-15: "the node pulse pop-up window is intrusive, can it run
' in background or stay in system tray."
'
' The Windows task LivingFactory-Schedule runs in the logged-on user's session
' on purpose (no stored password, see install-schedule.ps1), and a console
' program started in an interactive session always gets a console window - so
' node.exe flashed a window every five minutes. wscript.exe has no window of
' its own, and WScript.Shell.Run can start a command with window style 0
' (hidden) and WAIT for it, returning the exit code. The engine's exit code
' therefore still reaches Task Scheduler unchanged; only the window is gone.
'
'   wscript.exe //B //Nologo run-hidden.vbs "<exe>" "<arg>" ...
'
' Every argument is re-quoted, so paths with spaces ("E:\Program Files\nodejs")
' survive. The working directory is inherited from the task, which is what the
' engine reads its subject from - nothing here changes it.
Option Explicit
Dim sh, cmd, i
Set sh = CreateObject("WScript.Shell")
cmd = ""
For i = 0 To WScript.Arguments.Count - 1
  cmd = cmd & " """ & WScript.Arguments(i) & """"
Next
WScript.Quit sh.Run(Trim(cmd), 0, True)
