<script>
  // https://svelte.dev/docs#tweened
  import { tweened } from 'svelte/motion';

  // https://svelte.dev/docs#svelte_easing
  import { cubicInOut } from 'svelte/easing';

  export let skill;
  export let percent;
  export let color;
  export let delTime;

  const progress = tweened(15, {
    delay: delTime,
    duration: 1500,
    easing: cubicInOut,
  });

  // Changes the initial value of 30 to percent value in skillLevels array
  progress.set(percent);
</script>

<div class="container">
  <span class="skill"><b>{skill}</b></span>
  <div class="skills" style="width: {$progress}%; background-image: {color}">
    &nbsp;
  </div>
</div>

<style>
  .container {
    width: 100%;
    background-color: var(--tinted);
    margin-bottom: 15px;
    position: relative;
  }

  span {
    position: absolute;
    font-family: 'Lato', sans-serif;
    top: 10px;
    left: 10px;
    color: var(--white);
  }

  .skills {
    font-family: 'Lato', sans-serif;
    text-align: right;
    padding: 10px 0;
    right: 10px;
    font-weight: 500;
    color: white;
    transition: 0.5s ease-out;
  }
</style>
