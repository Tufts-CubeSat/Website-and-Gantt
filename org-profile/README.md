<p align="center">
  <img src="https://tufts-cubesat.vercel.app/CubeSat-Logo1.png" alt="Tufts CubeSat logo" width="120" />
</p>

<h1 align="center">Tufts CubeSat</h1>

<p align="center">
  Students at Tufts University building <b>SPACE RACCOON</b>, Tufts's first satellite.<br/>
  <a href="https://tufts-cubesat.vercel.app/">Website</a> ·
  <a href="https://tufts-cubesat.vercel.app/space-raccoon">Mission</a> ·
  <a href="https://tufts-cubesat.vercel.app/subteams">Subteams</a> ·
  <a href="https://tufts-cubesat.vercel.app/team">Team</a>
</p>

---

## 🛰️ The mission

**SPACE RACCOON** is a 2U CubeSat that will **detect, classify, and assess the collision risk of space debris** in Low Earth Orbit. It does this with onboard computer vision and machine learning.

- **Payload:** a modified GoPro captures frames during scheduled imaging windows. Onboard image processing and a neural network then find and classify debris.
- **Downlink:** only frames that contain debris are compressed, packetized, and sent over a VHF/UHF link to a student-built ground station.
- **Open by default:** flight software and debris data are released openly for safer orbital operations and for the student teams that come after us.

| Form factor | Orbit | Mission length | Target launch |
| :---: | :---: | :---: | :---: |
| 2U CubeSat | Low Earth Orbit | 14 months | 2029 |

We build with commercial off-the-shelf parts wherever possible, and we collaborate with **MIT** and **UMass Lowell**.

## 📂 Repositories

**Flight software & avionics**
- [SPACE-RACOON-Avionics](https://github.com/Tufts-CubeSat/SPACE-RACOON-Avionics): SPACE RACCOON flight software.
- [Avionics-Mainboard-Tufts](https://github.com/Tufts-CubeSat/Avionics-Mainboard-Tufts): KiCad design for our avionics mainboard (MCU, IMU, GPS, LoRa, power, SD). Forked from [CMU Argus](https://github.com/cmu-argus-2/Avionics-Mainboard).

**Payload: debris detection**
- [SPACE_RACCOON_CV_Modeling](https://github.com/Tufts-CubeSat/SPACE_RACCOON_CV_Modeling): ML and computer-vision models, GoPro scripts, and image processing for the payload.
- [Debris-Modeling-Streaks](https://github.com/Tufts-CubeSat/Debris-Modeling-Streaks): a synthetic star-field and debris-streak dataset generator, plus streak detectors that are evaluated against ground truth. It includes a lightweight prototype meant to run onboard.

**Mission analysis & simulation**
- [SPACE_RACCOON_Orbital_Mechanics](https://github.com/Tufts-CubeSat/SPACE_RACCOON_Orbital_Mechanics): orbital mechanics and LEO debris-probability analysis.
- [42-Tufts-CubeSAT](https://github.com/Tufts-CubeSat/42-Tufts-CubeSAT): spacecraft attitude and orbit simulation for ADCS analysis and design. Forked from NASA Goddard's [42](https://github.com/ericstoneking/42).

**Team & outreach**
- [Website-and-Gantt](https://github.com/Tufts-CubeSat/Website-and-Gantt): our [team website](https://tufts-cubesat.vercel.app/) and project timeline.
- [Outreach_Materials](https://github.com/Tufts-CubeSat/Outreach_Materials): workshops, slides, and design review materials from our outreach, including our Medford High School workshops.

**Past projects**
- [Tufts-SAC2024-CubeSAT](https://github.com/Tufts-CubeSat/Tufts-SAC2024-CubeSAT): payload sensor code for Tufts's Spaceport America Cup 2024 entry.

## 🧑‍🚀 Subteams

| Subteam | What we work on |
| --- | --- |
| **Structures** | Chassis CAD (Onshape), thermal and vibration analysis (ANSYS), machining, orbital mechanics |
| **Software** | Image processing (Python → C), flight software, FPGA, the neural network, the website |
| **Power** | Electrical power system and PCB design (KiCad/Altium), LTspice simulation |
| **Comms** | VHF/UHF link design, transceiver and antenna selection, the ground station, licensing |
| **Weather Balloon** 🆕 | High-altitude balloon flights to near space (~100,000 ft) to test our electronics and comms before orbit |

No experience is needed: every subteam teaches the tools it uses.

## 🤝 Get involved

- **Tufts students:** come to our all-team meeting, **Tuesdays 6:30–7:30pm in Halligan 145**. Subteam meeting times are on the [Subteams page](https://tufts-cubesat.vercel.app/subteams). We chat on the CubeSat Discord and the Tufts SEDS Slack.
- **Other student teams and researchers:** our code is open. Issues, pull requests, and questions are welcome on any repo.
- **Contact:** [William.Goldman@tufts.edu](mailto:William.Goldman@tufts.edu)

<p align="center"><sub>Tufts CubeSat is part of Tufts SEDS (Students for the Exploration and Development of Space).</sub></p>
