Study src/components/InvestmentEmpowerSection.jsx. I want you to work in it.
- We have a stack of images that we shall use to apply gsap animation
- There are bars with reference to image container for development only, they will be removed after deveopment.
- We shall use gsap animations with from to etc. via scroll plugin in order to move tiles on scroll with smooth mechanics

Background Scenerio:
- In beginning, everything will be slightly visible with a very low opacity and tiles scattered away in y axis.
- Upon scroll, the first tile shall move down to the central tile
- After that the bottom tile will also move and close the tiles box
- But we shall achieve it task by task.
- Currently only focus on current active task.

Completed tasks:
- the setup is completed, we have images and tiles.
- We have translate-y that we can play with in order to move them along with opacity adjustment.

Current Task:
- Our current task is to setup opening scene only
- In the opening, the y-axis of top tile is very negative keeping it at very top of screen. You can set that in vh. like calc(-50vh + size of image).
- The bottom tile will be at very bottom in similar way
- The central tile will be exactly where currently it is.

---

Lets stat from `translate(0px, -50vh)`. similarly 50vh for bottom tile.

---

Opening opacities:
- in opening, the top will have 100% opacity. middle 50% and bottom 10% opacity

---

Let's keep bottom's opacity 100% as it is already dull.
for top, it is displaying over other elements, that's why let's increase z-index of heading, para and button in the section.

---

Make changes to opening scene:
- first should be -100vh (as it is currently)
- second should be at -60vh
- third exactly where it is currently, i.e., 100vh

---

Now lets move forward to next phase and make its plan.
- take a look at top bar for "top-scroll" and bottom bar for "bottom-scroll".
- we are going to use same method for animating the tiles and their opacity.
- As top goes from 0 to full (as it is in bar):
    - top tile should translate from -100vh (current) to -25vh
    - middle should translate from -60vh (current) to 25vh and opacity should go from 50% to 100%
    - bottom tile should animate from 100vh to 90vh

add these points.

---

it is starting early. instead of stargint at 0, start it at 50

---

lets update end as well. insetad of 100, end it at 175. and:
- udpate top tile from -100 to 0
- update bottom tile from -60 to 30vh
- update bottom file from 100vh to 90vh

---

update ends:
- udpate top tile from -100 to -15vh
- update bottom tile from -60 to 15vh
- update bottom file from 100vh to 75vh

---

great. now for next part that will resume after this part of animation (175vh to 200vh scroll):
- udpate top tile from -15vh to 40vh
- update bottom tile from 15vh to 50vh
- update bottom file from 75vh to 60vh

---

it is not smooth. keep it  as a part of one animation only with breakpoints or something supported by gsap.

---

Also update the start time for pivots:
- they are starting at 50, start it at 75vh

---

Pivot:
- currently the pivot for middle tile is at 15vh and others are adjusted accordingly (when first animation ends and second starts)
- keep the scroll trigger points exactly same. just change the point that it rotates to
- instead of 15vh, lets move it to 0vh. Similarly subtract same amount from others in both animations (end of first, start of second)

---

