<script>
  import Nav from '../global/Nav.svelte';
  import Section from '../global/Section.svelte';

  const Mondriaan = 'https://en.wikipedia.org/wiki/Piet_Mondrian';
</script>

<Section id="about" class="about">
  <Nav title="About" />
  <div class="text">
    <p class="bold">
      I am a passionate Front-end Developer and UX/UI Designer from The
      Netherlands living near Amsterdam.
    </p>

    <h2>Let's get to know eachother.</h2>
    <p>
      In my free time i like to play video games. I like stealth-games, and love
      using peripherals to play games with a steering wheel or in VR. Some of my
      favourites are
    </p>
    <ul>
      <li>The HITMAN Trilogy</li>
      <li>Beat Saber</li>
      <li>The Half-life series</li>
    </ul>
    <p>
      ............I love pastels and also the colors <a
        class="bold"
        href={Mondriaan}
        target="_blank">Piet Mondriaan</a
      >
      used in his paintings
    </p>
  </div>
</Section>

<style>
  h2 {
    padding-bottom: 24px;
  }

  a {
    color: var(--blue);
    text-decoration: none;
  }
</style>
