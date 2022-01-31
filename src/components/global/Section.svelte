<script>
</script>

<section id={$$props.id} class={$$props.class}>
  <slot />
</section>

<style>
  section {
    display: grid;
    width: 100%;
    grid-template-columns: 1fr 1fr;
    grid-template-rows: 100%;
    scroll-snap-align: start;
  }

  .about {
    background: var(--red);
  }

  .skills {
    background: var(--blue);
  }

  .work {
    background: var(--yellow);
  }

  .contact {
    background: var(--green);
  }
</style>
