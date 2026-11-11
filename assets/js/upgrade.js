import { LANG_DATA } from './translations.js';
import { initVictus } from './victus.js';
const copy = {
tr:['Favoriler','Tüm arşiv','Tüm oyunlar','Oyun ara','Daha fazla göster','Önceki','Sonraki','Kapat','Steam’de aç','Görsel bulunamadı','Afişler','Görünümü sıfırla','Sürükleyerek döndür · Kaydırarak yakınlaştır','Tema'],
en:['Favorites','Full archive','All games','Search games','Load more','Previous','Next','Close','Open on Steam','No images found','Posters','Reset view','Drag to rotate · Scroll to zoom','Theme'],
es:['Favoritos','Archivo completo','Todos los juegos','Buscar juegos','Cargar más','Anterior','Siguiente','Cerrar','Abrir en Steam','No hay imágenes','Carteles','Restablecer vista','Arrastra para girar · Desplaza para ampliar','Tema'],
ru:['Избранное','Весь архив','Все игры','Поиск игр','Показать ещё','Назад','Далее','Закрыть','Открыть в Steam','Изображения не найдены','Плакаты','Сбросить вид','Перетащите для вращения · Прокрутите для масштаба','Тема'],
de:['Favoriten','Gesamtes Archiv','Alle Spiele','Spiele suchen','Mehr laden','Zurück','Weiter','Schließen','In Steam öffnen','Keine Bilder gefunden','Poster','Ansicht zurücksetzen','Ziehen zum Drehen · Scrollen zum Zoomen','Design'],
fr:['Favoris','Toutes les archives','Tous les jeux','Rechercher un jeu','Voir plus','Précédent','Suivant','Fermer','Ouvrir sur Steam','Aucune image','Affiches','Réinitialiser la vue','Glisser pour tourner · Défiler pour zoomer','Thème'],
jp:['お気に入り','全アーカイブ','すべてのゲーム','ゲームを検索','もっと見る','前へ','次へ','閉じる','Steamで開く','画像がありません','ポスター','視点をリセット','ドラッグで回転 · スクロールで拡大','テーマ'],
cn:['收藏','全部归档','所有游戏','搜索游戏','加载更多','上一张','下一张','关闭','在Steam中打开','没有图片','海报','重置视角','拖动旋转 · 滚动缩放','主题'],
pt:['Favoritos','Arquivo completo','Todos os jogos','Buscar jogos','Carregar mais','Anterior','Próximo','Fechar','Abrir no Steam','Nenhuma imagem','Pôsteres','Redefinir vista','Arraste para girar · Role para ampliar','Tema'],
it:['Preferiti','Archivio completo','Tutti i giochi','Cerca giochi','Mostra altro','Precedente','Successivo','Chiudi','Apri su Steam','Nessuna immagine','Poster','Ripristina vista','Trascina per ruotare · Scorri per ingrandire','Tema'],
kr:['즐겨찾기','전체 보관함','모든 게임','게임 검색','더 보기','이전','다음','닫기','Steam에서 열기','이미지가 없습니다','포스터','시점 초기화','드래그로 회전 · 스크롤로 확대','테마'],
ar:['المفضلة','الأرشيف الكامل','جميع الألعاب','البحث عن ألعاب','عرض المزيد','السابق','التالي','إغلاق','فتح في Steam','لا توجد صور','الملصقات','إعادة ضبط العرض','اسحب للتدوير · مرر للتكبير','المظهر'],
hi:['पसंदीदा','पूरा संग्रह','सभी गेम','गेम खोजें','और दिखाएँ','पिछला','अगला','बंद करें','Steam पर खोलें','कोई चित्र नहीं','पोस्टर','दृश्य रीसेट करें','घुमाने के लिए खींचें · ज़ूम करने के लिए स्क्रॉल करें','थीम'],
bn:['পছন্দের','সম্পূর্ণ সংগ্রহ','সব গেম','গেম খুঁজুন','আরও দেখুন','আগের','পরের','বন্ধ করুন','Steam-এ খুলুন','কোনো ছবি নেই','পোস্টার','দৃশ্য রিসেট করুন','ঘোরাতে টানুন · জুম করতে স্ক্রল করুন','থিম'],
nl:['Favorieten','Volledig archief','Alle games','Games zoeken','Meer laden','Vorige','Volgende','Sluiten','Openen in Steam','Geen afbeeldingen','Posters','Weergave herstellen','Sleep om te draaien · Scroll om te zoomen','Thema'],
pl:['Ulubione','Pełne archiwum','Wszystkie gry','Szukaj gier','Pokaż więcej','Poprzednie','Następne','Zamknij','Otwórz w Steam','Brak zdjęć','Plakaty','Resetuj widok','Przeciągnij, aby obrócić · Przewiń, aby przybliżyć','Motyw'],
sv:['Favoriter','Hela arkivet','Alla spel','Sök spel','Visa fler','Föregående','Nästa','Stäng','Öppna i Steam','Inga bilder','Affischer','Återställ vy','Dra för att rotera · Rulla för att zooma','Tema'],
vi:['Yêu thích','Toàn bộ kho','Tất cả trò chơi','Tìm trò chơi','Xem thêm','Trước','Tiếp','Đóng','Mở trên Steam','Không có ảnh','Áp phích','Đặt lại góc nhìn','Kéo để xoay · Cuộn để thu phóng','Giao diện'],
el:['Αγαπημένα','Πλήρες αρχείο','Όλα τα παιχνίδια','Αναζήτηση παιχνιδιών','Περισσότερα','Προηγούμενο','Επόμενο','Κλείσιμο','Άνοιγμα στο Steam','Δεν βρέθηκαν εικόνες','Αφίσες','Επαναφορά προβολής','Σύρετε για περιστροφή · Κύλιση για ζουμ','Θέμα'],
th:['รายการโปรด','คลังทั้งหมด','ทุกเกม','ค้นหาเกม','แสดงเพิ่มเติม','ก่อนหน้า','ถัดไป','ปิด','เปิดใน Steam','ไม่พบภาพ','โปสเตอร์','รีเซ็ตมุมมอง','ลากเพื่อหมุน · เลื่อนเพื่อซูม','ธีม']
};
const keys=['favorites','archive','all','search','more','prev','next','close','steam','empty','posters','reset','drag','theme'];
const names=['Türkçe','English','Español','Русский','Deutsch','Français','日本語','简体中文','Português','Italiano','한국어','العربية','हिन्दी','বাংলা','Nederlands','Polski','Svenska','Tiếng Việt','Ελληνικά','ไทย'];
export function currentCopy(){return copy[document.documentElement.dataset.uiLang] || copy.en;}
let items=[],filtered=[],limit=24,index=0;
const $=id=>document.getElementById(id);
function label(key){return currentCopy()[keys.indexOf(key)];}
function translate(){
 document.documentElement.dataset.uiLang=({ja:'jp','zh-CN':'cn',ko:'kr'})[document.documentElement.lang]||document.documentElement.lang;
 document.querySelectorAll('[data-u]').forEach(e=>e.textContent=label(e.dataset.u));
 $('museum-search').placeholder=label('search'); $('museum-search').ariaLabel=label('search');
 $('museum-game').ariaLabel=label('all'); $('museum-game').options[0].textContent=label('all');
 $('language-select').value=document.documentElement.dataset.uiLang;
 const code=$('language-select').value || 'en';
 $('language-name').textContent=names[Array.from($('language-select').options).findIndex(x=>x.value===code)] || code;
 document.querySelectorAll('.language-option').forEach(b=>b.setAttribute('aria-pressed',String(b.dataset.code===code)));
 render();
}
function card(item){
 const button=document.createElement('button'); button.type='button'; button.className='archive-card';
 const img=new Image(); img.src=item.image+'?imw=640&imh=360&ima=fit'; img.alt=`HaKING — ${item.game}`; img.loading='lazy'; img.decoding='async'; img.width=640; img.height=360;
 const title=document.createElement('span'); title.textContent=item.game;
 button.append(img,title); button.addEventListener('click',()=>{index=filtered.findIndex(x=>x.id===item.id);show();$('gallery-dialog').showModal();}); return button;
}
function render(){
 const search=$('museum-search').value.toLocaleLowerCase(); const game=$('museum-game').value;
 filtered=items.filter(x=>(!game||String(x.appid)===game)&&x.game.toLocaleLowerCase().includes(search));
 const favorites=filtered.filter(x=>x.favorite), rest=filtered.filter(x=>!x.favorite);
 $('favorite-grid').replaceChildren(...favorites.map(card)); $('archive-grid').replaceChildren(...rest.slice(0,limit).map(card));
 $('museum-count').textContent=`${filtered.length} / ${items.length}`;
 $('museum-more').hidden=rest.length<=limit; $('museum-empty').hidden=filtered.length>0;
}
function show(){const item=filtered[index];if(!item)return;$('gallery-image').src=item.original || item.image;$('gallery-image').alt=`HaKING — ${item.game}`;$('gallery-caption').textContent=`${item.game} · ${index+1} / ${filtered.length}`;$('gallery-steam').href=`https://steamcommunity.com/sharedfiles/filedetails/?id=${item.id}`;}
window.addEventListener('DOMContentLoaded',async()=>{
 $('gallery-image').addEventListener('load',()=>{$('gallery-image').style.maxWidth=$('gallery-image').naturalWidth+'px';});
 const select=$('language-select');
 Array.from(document.querySelectorAll('#lang-menu .lang-opt')).forEach((button,i)=>{const option=new Option(names[i],button.dataset.language);select.add(option);});
 select.addEventListener('change',()=>document.querySelector(`#lang-menu [data-language="${select.value}"]`)?.click());
 new MutationObserver(translate).observe(document.documentElement,{attributes:true,attributeFilter:['lang']});
 document.documentElement.dataset.theme='dark';
 const popover=$('language-popover'),trigger=$('language-trigger');
 function closeLanguages(){popover.hidden=true;trigger.setAttribute('aria-expanded','false');}
 function languageList(){const query=$('language-search').value.toLocaleLowerCase();$('language-options').replaceChildren(...Array.from(select.options).filter(o=>o.text.toLocaleLowerCase().includes(query)||o.value.includes(query)).map(o=>{const b=document.createElement('button');b.type='button';b.className='language-option';b.dataset.code=o.value;b.textContent=o.text;b.setAttribute('aria-pressed',String(o.value===select.value));b.addEventListener('click',()=>{select.value=o.value;select.dispatchEvent(new Event('change'));closeLanguages();trigger.focus();});return b;}));}
 trigger.addEventListener('click',()=>{$('language-search').value='';popover.hidden=!popover.hidden;trigger.setAttribute('aria-expanded',String(!popover.hidden));if(!popover.hidden){languageList();$('language-search').focus();}});
 $('language-search').addEventListener('input',languageList);
 document.addEventListener('click',e=>{if(!e.target.closest('.language-control'))closeLanguages();});
 document.addEventListener('keydown',e=>{if(popover.hidden)return;if(e.key==='Escape'){closeLanguages();trigger.focus();}if(e.key==='ArrowDown'||e.key==='ArrowUp'){e.preventDefault();const options=[...$('language-options').children];if(!options.length)return;const i=options.indexOf(document.activeElement);options[(i+(e.key==='ArrowDown'?1:-1)+options.length)%options.length].focus();}});
 document.querySelectorAll('.section').forEach(section=>{section.addEventListener('scroll',()=>{const progress=section.scrollTop/Math.max(1,section.scrollHeight-section.clientHeight);section.style.setProperty('--scroll-progress',progress);},{passive:true});});
 const observer=new IntersectionObserver(entries=>entries.forEach(e=>e.target.classList.toggle('revealed',e.isIntersecting)),{threshold:.12});document.querySelectorAll('.machine-story article,.support-card').forEach(e=>observer.observe(e));
 for(const id of ['museum-search','museum-game']) $(id).addEventListener('input',()=>{limit=24;render();});
 $('museum-more').addEventListener('click',()=>{limit+=24;render();});
 $('gallery-close').addEventListener('click',()=>$('gallery-dialog').close());
 $('gallery-dialog').addEventListener('click',e=>{if(e.target===$('gallery-dialog'))$('gallery-dialog').close();});
 $('gallery-prev').addEventListener('click',()=>{index=(index-1+filtered.length)%filtered.length;show();});
 $('gallery-next').addEventListener('click',()=>{index=(index+1)%filtered.length;show();});
 $('gallery-dialog').addEventListener('keydown',e=>{if(e.key==='ArrowRight')$('gallery-next').click();if(e.key==='ArrowLeft')$('gallery-prev').click();});
 translate(); initVictus();
 try{const response=await fetch('data/screenshots.json');if(!response.ok)throw Error();items=(await response.json()).items;
 const games=new Map(items.map(x=>[x.appid,x.game]));for(const [id,name] of [...games].sort((a,b)=>a[1].localeCompare(b[1])))$('museum-game').add(new Option(name,id));render();
 }catch{$('museum-count').textContent='Steam';$('museum-empty').hidden=false;}
});
