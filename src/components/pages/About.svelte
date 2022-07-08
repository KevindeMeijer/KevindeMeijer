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
      creating a sketch, working it out digitally, developing the first
      prototype, to the last bits of css that are causing a headache.
    </p>

    <p>
      I am currently studying at
      <a class="link" href={HU} target="_blank">Hogeschool Utrecht</a> based in the
      Netherlands.
    </p>

    <h3>Art Style</h3>
    <p>
      I love pastels and also the colors
      <a class="link" href={Mondriaan} target="_blank">Piet Mondriaan </a>
      used in his paintings.
    </p>

    <h3>My Skills</h3>
    <Skills />
  </div>
</Section>

<style>
  h3 {
    padding-bottom: 24px;
  }
</style>
