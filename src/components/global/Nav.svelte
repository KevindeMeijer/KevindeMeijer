<script>
  export let title;

  import NavItems from './NavItems.svelte';
</script>

<div class="chapter_title">
  <h1>{title}</h1>
</div>
<div class="chapter_nav">
  <NavItems />
</div>

<style>
  .chapter_title {
    color: var(--white);
    display: grid;
    place-items: center;
    text-align: center;

    grid-row: 1 / 2;
    grid-column: 1 / 2;
  }

  .chapter_nav {
    color: var(--white);
    display: grid;
    place-items: center;
    text-align: center;

    grid-row: 2 / 3;
    grid-column: 1 / 2;
  }
</style>
