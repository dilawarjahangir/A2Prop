In file `src/components/InvestmentEmpowerSection.jsx` i want you to:
- use scroll plugin. disable the motion plugin.
- the scroll from GSAP library.
- currently add taht from current position
- upon windows scroll it should expand the images
- currently all of them are stacked in one place
- but with a distance of 100px, they should go from initial place to 100px distance
- remember to move first image to top, keep the central svg image static, do not move it anywhere
- the image at bottom should move towards bottom direction
- this should tightly and nicly bound with scroll, so that user may scroll back mid-way to get it in reverse direction and back stacked again.

understand requirements and make a short plan.
You can change the usage or structure of this component. i guess there's no need for motion from framer in this case.

----

Let's use %age of parent container instead of pixels for spacing.
- We should use 50% width of container for image size
- for sliding up, let's move them apart by 50vh and back to initial position with transition on scroll

adjust these scaling and measurements.

----

Next-up;
- now we need to change the mechanis of this animation
- currently they are centered aligned
- but let's adjust them
- on start, there must be an upper tile visible only when it enters the view
    - but this upper tile should be on the very top of section. i.e., on its most top position
    - when scrolld slowly, it is moving dowanrds upto the center at the end of animation
    - the end of animation is nearly when bottom reaches half of screen while scrolling section downards (i.e., section content is moving upwards the screen)
- Now for the central tile image. previously it was fixed. but now we shall move it a bit:
    - In start it should not be visible
    - But when top reaches 50% of screen, i.e., we half entereed from top
    - It should slide up from very bottom upto center.
    - This slid-up should end when element's top is at 0. i.e., touching the roof of visible screen.
- For the third tile, i.e., the bottom tile
    - It should be moved upwoards at the very end
    - this upward moving animation should start when top reaches the roof
    - and as element scrools, so that the bottom is at 50% (center) of screen, then it is completed
- In this way we have a nicely stacking set of tiles on scroll with a very nice animation
- you can use `ease-in` style scroll-movement for all tiles movements with scroll.

---

This divs gets very sticky to upper and lower elements:
- Lets increase size of this section a bit more than 100vh
- by adding a bit of padding on y


<-->