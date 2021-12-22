<svelte:head>
  <link rel="stylesheet" href="https://cdnjs.cloudflare.com/ajax/libs/font-awesome/4.7.0/css/font-awesome.min.css">
</svelte:head>

<script>
  export let link;
  export let color;
  export let fa_icon;
</script>

<div class="socials">
  <a target="_blank" href="{link}">
	<div class={color}>
		<div class="icon">
			<i class={fa_icon}></i>
		</div>
	</div>
  </a>
</div>

<style>
.socials {
  position: relative;
}

a {
  color: black;
  text-decoration: none;
}

.socials .social-icon {
  width: 70px;
  height: 70px;
  background: #eee;
  border: 2px solid var(--black);
  float: left;
  margin-right: 35px;
  margin-bottom: 15px;
  overflow: hidden;
  cursor: pointer;
}

.socials .social-icon .icon {
  width: 70px;
  height: 70px;
  line-height: 80px;
  text-align: center;
}

.socials .social-icon .icon i.fa {
  font-size: 35px;
  transition: all 250ms ease-in-out 100ms;
}

.socials .social-icon .icon:after {
  width: 70px;
  height: 70px;
  content: '';
  display: block;
  margin-top: 0px;
  transition: all 250ms ease-in-out;
}

.socials .social-icon:hover .icon:after {
  margin-top: -80px;
}

.socials .social-icon:hover .icon i.fa {
  color: var(--white);
}

.socials .social-icon.github .icon:after {
  background: #333;
}

.socials .social-icon.linkedin .icon:after {
  background: #0077b5;
}

.socials .social-icon.instagram .icon:after {
  background: #3f729b;
}

.socials .social-icon.youtube .icon:after {
  background: #ff0000;
}

.socials .social-icon.twitch .icon:after {
  background: #9146ff;
}

.socials .social-icon.codepen .icon:after {
  background: #0ebeff;
}

.socials .social-icon.telegram .icon:after {
  background: #0088cc;
}

.socials .social-icon.steam .icon:after {
  background: #2a475e;
}
</style>