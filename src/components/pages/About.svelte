<script>
  import Nav from "../global/Nav.svelte";
  import Section from "../global/Section.svelte";

  const Mondriaan = "https://en.wikipedia.org/wiki/Piet_Mondrian"
</script>

<Section id="about" class="about">
<Nav title="About"/>
  <div class="text">
    <p class="bold">I am a passionate Front-end Developer and UX Designer from The Netherlands living
      near Amsterdam.</p>
    <p>I love designing logo's, creating artwork, digital design, Photoshop and I am currently
      studying at Hogeschool Utrecht.</p> 
    
    <h2>Art Style</h2>
    <p>My inspiration comes from various sources. I try to incorporate accessibility into my
      designs, and and am all about making them futureproof.</p>
    <p>............I love pastels and
      also the colors <a class="bold" href={Mondriaan} target="_blank">Piet Mondriaan</a>
      used in his paintings</p>
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