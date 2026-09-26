(() => {
  'use strict';
  const version = new URLSearchParams(location.search).get('kornyek');
  if (!['1','2','3'].includes(version)) return;
  const art = document.querySelector('.house-art');
  const img = art.querySelector('img');
  if (version === '3') {
    document.body.classList.add('location-separated');
    img.classList.add('location-house-image');
    const origin = 'Mullers 2, Kalman Imre setany 9, Siofok';
    const destinations = [
      ['tower', 'Víztorony', '260 m gyalog', 'Siofoki Viztorony'],
      ['harbor', 'Balaton · Hajóállomás', '700 m gyalog', 'Siofok hajoallomas'],
      ['garden', 'Rózsakert', '900 m gyalog', 'Rozsakert, Siofok']
    ];
    for (const [name, alt] of [['tower', 'A siófoki Víztorony szemléltető épületmodellje'], ['shore', 'Balatoni part és rózsakerti sétány szemléltető látványa']]) {
      const layer = document.createElement('div'); layer.className = `landmark landmark-${name}`;
      const photo = document.createElement('img'); photo.src = `assets/${name}-v3.webp`; photo.alt = alt;
      layer.append(photo); art.append(layer);
      photo.addEventListener('error', () => { layer.hidden = true; }, {once:true});
    }
    for (const [name, title, distance, destination] of destinations) {
      const link = document.createElement('a'); link.className = `landmark-label landmark-label-${name}`;
      link.href = `https://www.google.com/maps/dir/?api=1&origin=${encodeURIComponent(origin)}&destination=${encodeURIComponent(destination)}&travelmode=walking`;
      link.target = '_blank'; link.rel = 'noopener';
      const heading = document.createElement('span'); heading.textContent = title;
      const detail = document.createElement('small'); detail.textContent = distance;
      const icon = document.createElementNS('http://www.w3.org/2000/svg','svg'); icon.setAttribute('viewBox','0 0 24 24'); icon.setAttribute('aria-hidden','true');
      const use = document.createElementNS('http://www.w3.org/2000/svg','use'); use.setAttribute('href','#arrow'); icon.append(use);
      link.append(icon, heading, detail); art.append(link);
    }
    return;
  }
  const composition = document.createElement('div');
  composition.className = 'location-composition';
  art.append(composition); composition.append(img);
  img.src = version === '2' ? 'assets/house-location-v2.webp' : 'assets/house-location.webp';
  if (version === '2') {
    const picture = document.createElement('picture');
    const source = document.createElement('source');
    source.media = '(max-width:700px)'; source.srcset = 'assets/house-location-mobile-v2.webp';
    composition.append(picture); picture.append(source,img);
  }
  img.alt = 'Szemléltető épületmakett: a Müllers 2 előtérben, a siófoki víztorony balra és egy balatoni partrészlet jobbra';
  document.body.classList.add('location-proof');
  if (version === '2') document.body.classList.add('location-refined');
  for (const [position,title,detail] of [['tower','Víztorony','kb. 150 m'],['lake',version === '2' ? 'Balaton · Rózsakert' : 'Balaton-part','']]) {
    const label=document.createElement('span');label.className=`location-label location-${position}`;
    const icon=document.createElementNS('http://www.w3.org/2000/svg','svg');icon.setAttribute('viewBox','0 0 24 24');icon.setAttribute('aria-hidden','true');
    const use=document.createElementNS('http://www.w3.org/2000/svg','use');use.setAttribute('href','#arrow');icon.append(use);label.append(icon);
    const name=document.createElement('span');name.textContent=title;label.append(name);
    if(detail){const small=document.createElement('small');small.textContent=detail;label.append(small);}
    composition.append(label);
  }
  img.addEventListener('error',()=>{composition.querySelectorAll('source').forEach(el=>el.remove());img.src='assets/house.webp';img.alt='A Müllers 2 épületillusztrációja';document.body.classList.remove('location-proof','location-refined');composition.querySelectorAll('.location-label').forEach(el=>el.remove());},{once:true});
})();
