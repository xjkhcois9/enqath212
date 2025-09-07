document.getElementById('join-form').addEventListener('submit', async (e)=>{
  e.preventDefault();

  const profile = {
    name: document.getElementById('name').value,
    profession: document.getElementById('profession').value.trim(),
    traits: document.getElementById('traits').value.split(',').map(t=>t.trim())
  };

  // تحميل المجتمعات الأساسية من ملف JSON + المخصصة من localStorage
  const res = await fetch('communities.json');
  const baseCommunities = await res.json();
  const custom = JSON.parse(localStorage.getItem('customCommunities') || '[]');
  const communities = [...baseCommunities, ...custom];

  const scored = communities.map(c => ({
    ...c,
    score: computeScore(profile, c)
  }));

  scored.sort((a,b)=>b.score - a.score);
  renderResults(scored.slice(0,3), profile);
});

function computeScore(profile, community){
  let score = 0;
  if(community.professions.includes(profile.profession)) score += 30;
  profile.traits.forEach(t=>{
    if(community.tags.includes(t)) score += 10;
  });
  return score;
}

function renderResults(list, profile){
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
    btn.onclick = ()=> openRoom(c, profile);
    div.appendChild(btn);
    container.appendChild(div);
  });
}

function openRoom(community, profile){
  document.getElementById('main').classList.add('hidden');
  document.getElementById('room').classList.remove('hidden');
  document.getElementById('room-title').innerText = community.name;

  const key = 'room_' + community.name;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  const messagesDiv = document.getElementById('messages');
  messagesDiv.innerHTML = '';
  saved.forEach(m => {
    const div = document.createElement('div');
    div.textContent = m.user + ': ' + m.text;
    messagesDiv.appendChild(div);
  });

  localStorage.setItem('currentRoom', community.name);
  localStorage.setItem('currentUser', profile.name);
}

function sendMessage(){
  const text = document.getElementById('chat').value;
  if(!text) return;
  const room = localStorage.getItem('currentRoom');
  const user = localStorage.getItem('currentUser');

  const key = 'room_' + room;
  const saved = JSON.parse(localStorage.getItem(key) || '[]');
  saved.push({user, text});
  localStorage.setItem(key, JSON.stringify(saved));

  const messagesDiv = document.getElementById('messages');
  const div = document.createElement('div');
  div.textContent = user + ': ' + text;
  messagesDiv.appendChild(div);
  document.getElementById('chat').value = '';
}

function backToMain(){
  document.getElementById('room').classList.add('hidden');
  document.getElementById('main').classList.remove('hidden');
}

// إنشاء بيئة جديدة
document.getElementById('create-form').addEventListener('submit', (e)=>{
  e.preventDefault();
  const community = {
    name: document.getElementById('c-name').value,
    description: document.getElementById('c-description').value,
    professions: document.getElementById('c-professions').value.split(',').map(p=>p.trim()),
    tags: document.getElementById('c-tags').value.split(',').map(t=>t.trim())
  };

  const saved = JSON.parse(localStorage.getItem('customCommunities') || '[]');
  saved.push(community);
  localStorage.setItem('customCommunities', JSON.stringify(saved));

  alert('✅ تمت إضافة البيئة بنجاح!');
  e.target.reset();
});
