<script>

</script>

<section id={$$props.id} class={$$props.class}>
  <slot></slot>
</section>

<style>
section {
  display: grid;
  width: 100%;
  grid-template-columns: 1fr 1fr;
  grid-template-rows: 100%;
}

.about {
  background: var(--red);
}

.skills {
  background: var(--blue);
}

.contact {
  background: var(--yellow);
}
</style>