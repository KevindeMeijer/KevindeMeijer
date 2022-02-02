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

  .home {
    background: var(--black);
    color: var(--white);

    grid-template-columns: 100%;
    grid-template-rows: 1fr 1fr;
  }

  .about {
    background: var(--red);
  }

  .work {
    background: var(--blue);
  }

  .contact {
    background: var(--yellow);
  }

  .map {
    background: var(--green);
  }
</style>
