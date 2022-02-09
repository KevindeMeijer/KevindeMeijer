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
    grid-template-rows: 1fr 1fr;
    scroll-snap-align: start;
  }

  .home {
    background: var(--black);
    color: var(--white);

    grid-template-columns: 100%;
    grid-template-rows: 2fr 1fr;
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

  @media only screen and (max-width: 900px) {
    section {
      display: grid;
      width: 100%;
      grid-template-columns: 100%;
      scroll-snap-align: start;
    }

    .home {
      height: 100vh;
    }

    .about {
      height: 130vh;
      grid-template-rows: 20vh 10vh 50vh 50vh;
    }

    .work {
      /* !!! THIS WILL F*CK ME UP IN THE FUTURE */
      height: 50vh;
      grid-template-rows: 20vh 10vh 10vh 10vh;
    }

    .contact {
      height: 130vh;
      grid-template-columns: 100%;
      grid-template-rows: 20vh 10vh 50vh 50vh;
    }
  }
</style>
