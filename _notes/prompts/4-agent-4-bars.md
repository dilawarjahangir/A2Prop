for src/components/InvestmentEmpowerSection.jsx's GSAP animation Now iw ant you to:
- create a progress bar that has 100%width
- it fills with black on scroll

Use GSAP Scroll plugins and Scroll Trigger to smoothly transit it.
It is for starter.

---

Instead of 1, make 2 bars:
- first will be empty
- it should start when element's top enters viewport. and it should slowl increase and go to 100% as top touches the top of screen
- similarly the second one will be full (add it at end of section instead of start unlike top bar)
- this bar should be full initially and keep on reducing untill section's top reaches page's top (i.e., section completely scrolls out of viewport)

Create them as a saperate test component in src > components > dev > [name[.jsx and import and use. you can make one or two.

Component should only accept progress level. all the scroll and gsap animation logi must be kept in section @InvestmentEmpowerSection.jsx .

---

Top movement looks accurate but bottom bar is not:
- when top of section is at bottom, bar is 100T. which is nice
- when top of section is at 50% (mid), bar is 50%
- when top of section reaches the top of viewport, then bar reaches 100%

Similarly:
- Bottom of section should be 100% in start
- when bottom of section reaches bottom of viewport, only then it should start shrinking
- and when bottom of viewport is at 50vh (center of screen), then set bar to 100%
- similarly as it bottom of viewport reaches the viewport top, bar should gradually decrease to zero when it does.

---

The reference should be related to `InvestmentEmpowerSection` element:
- when top of `InvestmentEmpowerSection` reaches top of viewport, the first bar should be full
- Similarly when bottom is visible at bottom of viewport, only then it should start reducing, and stop when bottom fully reaches the top (complete section is invisible)

Adjust accordingly.