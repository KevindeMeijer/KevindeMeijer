<script>
  import Nav from '../global/Nav.svelte';
  import Section from '../global/Section.svelte';
  import SocialIconArray from '../content/SocialIconArray.svelte';
</script>

<Section id="contact" class="contact">
  <Nav title="Contact" />
  <div class="text">
    <h2>Kevin de Meijer</h2>
    <br />
    <p>UX / UI Design <br />Front-end Development</p>
    <p class="bold">
      Feel free to get in Touch if you want to collaborate on something cool or
      interesting. I'm always open to learn, and up for a challenge.
    </p>
    <br />

    <SocialIconArray />
  </div>
  <div class="map">
    <iframe
      title="Hot singles in my area"
      scrolling="no"
      marginheight="0"
      marginwidth="0"
      src="https://maps.google.com/maps?width=100%25&amp;height=100%25&amp;hl=nl&amp;q=Gooise%20Meren+()&amp;t=&amp;z=7&amp;ie=UTF8&amp;iwloc=B&amp;output=embed"
      width="100%"
      height="100%"
      frameborder="0"
      style="border: 0;"
    />
  </div>
</Section>

<style>
  .text {
    grid-row: 1 / 2;
    grid-column: 2 / 3;
  }

  .map {
    background-color: var(--background);
    grid-row: 2 / 3;
    grid-column: 2 / 3;
  }
</style>
