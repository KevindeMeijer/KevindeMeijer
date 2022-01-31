<script>
  export let title;

  import NavItems from './NavItems.svelte';
</script>

<div class="chapter_title">
  <h1>{title}</h1>
  <NavItems />
</div>

<style>
  .chapter_title {
    color: var(--white);
    display: grid;
    place-items: center;
    text-align: center;
  }
</style>
