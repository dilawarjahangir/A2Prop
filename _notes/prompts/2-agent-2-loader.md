I want you to create a page's loader using gsap:

- lets start a saperate component
- when added it starts as an overlay on entire website
- and disables scroll for body and html
- it should have a few seconds of animation
- then it should hide
- For reference, youc an study project at https://github.com/MAbdullahAhmad/timeline. in this repo study a loader which is built in same way
- You can study the component that is rendered in app
- similarly you can create a gsap animating component and add it to main app.

complete this setup

---

For animation, let's start fresh:

- I want you to start with a pure white #fff screen
- Then it should scroll a black full-screen #fff div from bottom to up and after staying for 1 second, it should go back to bottom.
- This should be a 300ms to 500ms transition
- let's keep it this forn now we shall add other improvements later.

---

lets keep black screen visible for 3 second. wait for 1 second (with white) before starting animation. fade out at end instead of suddenl y removing white. make sure fade starts after white fully occupied the viewport

---

