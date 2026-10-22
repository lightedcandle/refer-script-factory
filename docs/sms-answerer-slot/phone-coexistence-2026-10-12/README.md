# Can the SMS bridge and the guide's model run on the same phone? (2026-10-12)

The SMS half of shelf G10 in the Telechurch repo. This is the measurement the
first phone trial said was missing: the model was never run while the bridge app
was working.

**No SMS was sent or queued, the bridge's settings were not opened or changed,
and nothing was wired to anything.** The model listened only on the phone's own
loopback address and was asked questions over the USB cable.

## What was run

- **Phone:** the operator's Galaxy S26 Ultra (SM-S948U, 11 GB memory), adb
  serial `R5GL41X25TF`, on the USB cable. (A second adb entry,
  `192.168.1.101:5555`, is the same phone over Wi-Fi.)
- **Bridge:** `org.alliance.smsbridge`, already running as a foreground service
  and untouched. It had been up 3 days 19 hours when the test began.
- **Model:** the files the first trial left at `/data/local/tmp/tc-guide-trial/`
  (Nemotron 3 Nano 4B, Q4_K_M, llama.cpp `b11577`), started as
  `llama-server -m ../nemotron.gguf -t 6 -c 4096 --host 127.0.0.1 --port 18080 --reasoning-budget 0`
  (thinking off).
- **Window:** 22:38 to 22:47 local, about nine minutes, with the screen on for
  the first part and off for about five minutes.
- **Questions:** the same ten visitor questions as the first trial, sent by the
  same script (`tools/factory/phone-guide-trial.cjs` on the Telechurch branch
  `claude/phone-trial-g10-windows-hooks`), about the same invented church.
- **Memory:** read from the phone every four seconds by `memory-sampler.cjs`
  (108 samples, `memory-samples.json`). Kills were read from Android's own
  low-memory log.

## What was measured

| | Before the model | With the model running |
| --- | --- | --- |
| Bridge app memory | 117 MB | 108 to 116 MB |
| Bridge process | pid 19436 | pid 19436, the same process throughout |
| Bridge still checking in with the cloud | yes | yes, a pulse every 67 seconds, none missed |
| Model memory | none | 3.7 GB after loading, **5.0 GB at the end and still rising** |
| Memory the phone had to spare | 5.8 GB | 3.5 GB at the lowest |
| Battery temperature | 27 C | 34 C |

- **Android did not kill the bridge.** Same process before, during and after,
  and its minute pulses kept arriving on time.
- **Android did not kill the model either, but that result does not count** —
  see the first item under "not proven".
- **Android did kill 44 other things to make room**, all of them apps sitting
  idle in the background (Gmail, Samsung Health, Samsung Notes, Android Auto and
  the like). Nothing in use and nothing belonging to the bridge.
- **With the screen off the model is about seven times slower.** Screen on:
  16 to 18 tokens a second, a short reply in 2 to 5 seconds. Screen off: 2.0 and
  2.8 tokens a second on two tries, so the same short reply took 30 and 15
  seconds. The first question after waking the screen was still slow (2.1); the
  next was back to 15.7. The phone was on charge the whole time.
- **The model's memory was higher than the first trial reported**: 5.0 GB
  against 4.1 GB, and it had not levelled off when the test ended.

## The ten answers this time

Same questions, same instructions, one sample each (`ten-questions.json`).

- Grief, crisis and "can a pastor call me" were handed to a person: 3 of 3.
  This time the crisis reply named 988 and 911, and so did the grief reply,
  where it was not asked for.
- The children's question was handed off with no answer again, though the fact
  was in front of it.
- **It invented more than last time.** Dress code: "There's no dress code."
  Baptism: "We do baptisms. There is no cost." Neither fact was given to it.

Two runs, two different sets of mistakes. That is the point: one sample is not a
rate, and the model cannot be the thing that decides what is true or what is a
crisis.

## What this does not prove

- **The model was started from the developer cable, which makes it
  unkillable.** Android gave it the protection of a system tool (priority
  −1000). A real app on the phone gets ordinary priority, like the bridge's
  (200), and Android may well choose to kill a 5 GB app before it kills forty
  small ones. Whether the model survives as an app is untested, and it is the
  question that matters.
- **Nine minutes is not a day.** Memory was still climbing. Nothing here says
  what happens overnight, or after a few hundred questions.
- **The bridge was idle.** No text arrived and none was sent during the test, on
  purpose. The bridge was alive beside the model; it was not shown sending and
  receiving beside it.
- **Why the screen-off slowdown happens was not pinned down.** The phone did not
  report overheating and did not move the model to the slow processor cores, so
  the likely cause is the phone's own power saving while asleep. No setting was
  changed to test that, because changing phone settings was out of bounds.
- **Off the charger was not tried.**
- Stopping the model needed a hard kill; it ignored the polite stop request sent
  over the cable. Recorded in `docs/known-limits-and-constraints.md`.

## Reading

The two can share the phone: the bridge is small and Android protects it. The
cost is that the phone gives up nearly everything else it was holding in the
background, and that a reply takes 15 to 30 seconds when the phone is asleep,
which is where a bridge phone spends its life. That is acceptable for a text
message if the person is told nothing misleading while they wait. It is one more
reason the answerer has to be a slot that can move off the phone without the
bridge noticing.

## Left on the phone

`/data/local/tmp/tc-guide-trial/` as the first trial left it, plus one new log
file, `server-coexist.log`. The model is stopped and the cable's port forward is
removed. The bridge was running, untouched, when the session ended.
