Study src/components/InvestmentEmpowerSection.jsx. I want you to work in it.
- There is a back file in same folder. it was a previous failed animation attempt
- I wan tyou to only take the svgs and create a stack for now
- without any animations, just a simple stack in start.
- Keep the dev bars and their animation for now as they are. They are for development they will be removed after complete development.

Images:
- Set images to 50% of viewport width. set height auto
- first stack all images in center without any spacing. directly on top of each other
- Then use a variable to translateY them. the first image shoudl translate y with -10%. second at 0%, third at 10% (positive)
- Set these values in such a way so that they can be animated later with GSAP animations.

---

For images, update their translation and z-index like following:

```html
<div class="relative w-full max-w-md sm:w-[50vw] md:w-[40vw] lg:w-[30vw] aspect-[416/279] overflow-visible"><img alt="A2 Properties logo stack" class="absolute inset-0 w-full h-auto" src="/assets/icons/AnimationParts/Frame%2098.svg" style="transform: translateY(-10%);/* display: none; */z-index: 3;"><img alt="A2 Properties base layers" class="absolute inset-0 w-full h-auto" src="/assets/icons/AnimationParts/Group%2099.svg" style="transform: translateY(0%);/* display: none; */z-index: 2;"><img alt="A2 Properties middle layer" class="absolute inset-0 w-full h-auto" src="/assets/icons/AnimationParts/Frame%203467.svg" style="transform: translateY(10%);/* display: none; */z-index: 1;"></div>
```