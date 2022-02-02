<script>
  import Nav from '../global/Nav.svelte';
  import Section from '../global/Section.svelte';
  import Skills from '../content/Skills.svelte';

  const Mondriaan = 'https://en.wikipedia.org/wiki/Piet_Mondrian';
  const HU = 'https://www.hu.nl/';
</script>

<Section id="about" class="about">
  <Nav title="About" />
  <div class="text">
    <p class="bold">
      I am a passionate Front-end Developer and UX Designer from The
      Netherlands.
    </p>
    <p>
      My areas of expertise encompass all Front-end work you can dream of: from
      creating a sketch, working it out digitally, devoloping the first
      prototype, to the last bits of css that are causing a headache.
    </p>

    <p>
      I am currently studying at
      <a class="link" href={HU} target="_blank">Hogeschool Utrecht</a> based in the
      Netherlands.
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

    <h2>Art Style</h2>
    <p>
      I love pastels and also the colors
      <a class="link" href={Mondriaan} target="_blank">Piet Mondriaan </a>
      used in his paintings.
    </p>

    <h2>My Skills</h2>
    <Skills />
  </div>
</Section>

<style>
  h2 {
    padding-bottom: 24px;
  }
</style>
