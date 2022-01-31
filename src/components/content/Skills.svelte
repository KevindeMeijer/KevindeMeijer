<script>
  // https://www.w3schools.com/howto/howto_css_skill_bar.asp
  import Skillbar from '../content/Skillbars.svelte';

  const skillLevels = [
    {
      skill: 'HTML',
      percent: 100,
      color: 'var(--red_gradient_flip)',
      delTime: 0,
    },
    {
      skill: '(S)CSS',
      percent: 95,
      color: 'var(--red_gradient_flip)',
      delTime: 500,
    },
    {
      skill: 'JavaScript',
      percent: 70,
      color: 'var(--red_gradient_flip)',
      delTime: 1000,
    },
    {
      skill: 'Svelte',
      percent: 55,
      color: 'var(--red_gradient_flip)',
      delTime: 1500,
    },
    {
      skill: 'React',
      percent: 50,
      color: 'var(--red_gradient_flip)',
      delTime: 1500,
    },
    {
      skill: 'Vue',
      percent: 20,
      color: 'var(--red_gradient_flip)',
      delTime: 2500,
    },
  ];
</script>

<div>
  {#each skillLevels as { skill, percent, color, delTime }}
    <Skillbar {skill} {percent} {color} {delTime} />
  {/each}
</div>
