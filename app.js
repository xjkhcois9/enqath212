document.getElementById('join-form').addEventListener('submit', async (e)=>{
  e.preventDefault();

  const profile = {
    name: document.getElementById('name').value,
    profession: document.getElementById('profession').value.trim(),
    traits: document.getElementById('traits').value.split(',').map(t=>t.trim())
  };

  const res = await fetch('communities.json');
  const communities = await res.json();

  const scored = communities.map(c => ({
    ...c,
    score: computeScore(profile, c)
  }));

  scored.sort((a,b)=>b.score - a.score);
  renderResults(scored.slice(0,3));
});

function computeScore(profile, community){
  let score = 0;
  if(community.professions.includes(profile.profession)) score += 30;
  profile.traits.forEach(t=>{
    if(community.tags.includes(t)) score += 10;
  });
  return score;
}

function renderResults(list){
  const container = document.getElementById('results');
  container.innerHTML = '';
  list.forEach(c=>{
    const div = document.createElement('div');
    div.className = 'community';
    div.innerHTML = `
      <strong>${c.name}</strong> (درجة المطابقة: ${c.score})<br>
      <small>${c.description}</small><br>
    `;
    const btn = document.createElement('button');
    btn.innerText = 'ادخل إلى البيئة';
    btn.onclick = ()=> window.location.href = c.link;
    div.appendChild(btn);
    container.appendChild(div);
  });
}
