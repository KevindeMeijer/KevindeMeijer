<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</svelte:head>

<script>
  import Nav from "../global/Nav.svelte";
  import Section from "../global/Section.svelte";
  import SocialIcons from "../content/SocialIcons.svelte";
</script>

<Section id="contact" class="contact">
<Nav title="Contact"/>
  <div class="text">
    <h2>Kevin de Meijer</h2><br>
    <p>UX / UI Design <br>Front-end Development</p>
    <p class="bold">Feel free to get in Touch if you want to collaborate on something cool or interesting.
      I'm always open to learn and up for a challenge.</p>
    <p>I'm currently unavailible for any projects that fall outside of my study.</p>

    <SocialIcons 
      link="https://github.com/KevindeMeijer"
      color="social-icon github"
      fa_icon="fa fa-github"
    />

    <SocialIcons 
      link="https://steamcommunity.com/id/kevkev_beast/"
      color="social-icon steam"
      fa_icon="fa fa-steam"
    />
      
    <SocialIcons 
      link="https://www.instagram.com/kevkevdemeijer/"
      color="social-icon instagram"
      fa_icon="fa fa-instagram"
    />

    <SocialIcons 
      link="https://www.linkedin.com/in/kevindemeijer/"
      color="social-icon instagram"
      fa_icon="fa fa-linkedin-square"
    />

    <SocialIcons 
      link="https://codepen.io/Kevin_de_Meijer"
      color="social-icon codepen"
      fa_icon="fa fa-codepen"
    />

    <SocialIcons 
      link="https://t.me/KevindeMeijer"
      color="social-icon telegram"
      fa_icon="fa fa-telegram"
    />

    <SocialIcons 
      link="https://www.twitch.tv/kevkev_beast"
      color="social-icon twitch"
      fa_icon="fa fa-twitch"
    />

    <SocialIcons 
      link="https://www.youtube.com/watch?v=dQw4w9WgXcQ"
      color="social-icon youtube"
      fa_icon="fa fa-youtube-play"
    />

    
  </div>
</Section>

<style>

</style>