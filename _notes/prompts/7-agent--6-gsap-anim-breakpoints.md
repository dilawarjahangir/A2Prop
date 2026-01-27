there is a breakpoint highly visible, insetad it should naturally scroll as moving with user's scroll in first part of animation. update according

---

Build an understanding from following:
- by adusting breakpoints and scroll trigger points, ew need to animate these tiles
- in such a way that the middle tile appears from bottom and then on scroll it remains in the center of viewport. it is a slow slide-up
- but when it goes to end, there should be a faster slide-up sliding it up.
- the upper tile is like coming from top like a cap. but keeping a 20-25vh of gap from middle
- before sliding-up, the bottom tile comes up faster like something to take-off along-with the middle-tile from bottom.
- It should always keep a 5-10vh distance from middle tile and when it comes from bottom, the middle tile should also start sliding up with it.

Visualize this understanding and propose a set of breakpoints we can use with tiles and viewport during scroll.

---

Updates:

- You centered the top tile, instead of top tile, the middle tile is the one to be centored
- Like in itially, the top tile will come from top, and bottom will slide up fastly to make two tiles at 30vh distance in between
- as user scrolls to 85% (out of 200vh), it goes from 30vh distance to 20vh distance in between while keeping both veritcally centered
- at 50% distance (in center of 200vh height), the bottom tile start appearing slowly from bottom, but very slowly upto 85%
- at 85%, it takes speed slowly and jumps to top
- while this jump from 85% to 100%, the distance between top and midle tyle should go from 20vh to 10vh. and distance between bottom tile and middle tile goes from 10vh to 5vh.

I hope you can imagine.
Update accordingly.

---

No . by center i mean center of viewport (screen) not 0vh (center of section) that does not matters.
We need them for sliding.

Consider it that what you are currently doing, we need to do same, but initially top and middle tiles shoudl come from top and bottom. then it is locked at center as user scrolls (by those values) and at 85%, it slides up with all 3 tiles.

re-build plan.

---

still not working. checkout that when first bar starts changing its progress, then we need to start. and when second bar stops then we need to end.

And i guess you need to understand that container is 200vh. so adjust transalteY accordingly for these images to keep it centered.
You can study at `_notes/prompts/6-agent-6-gsap-anim.md` on how we worked

instead of 3 parts. it is a 2 parts. one is sliding in, second is sliding out.
The slid and everything is a part of this flow.

Make appropriate plan now

---

still there's some problem. maybe ref or something. compare with those commits. because when i scroll, i do not see anythingat all in the start of images container. i only see after scrolling like a full 100vh approximately

---