# Mobil hero: a három jóváhagyott szövegsor visszaállítása

2026-10-03. A korábbi `location.css` mobilos `.hero-sidecopy{display:none}` szabálya az új szöveget is elrejtette. A tulajdonos kérésére külön mobilos kiegészítés visszaállítja a blokkot a szólogó alá, három olvasható sorban. A tartalom változatlan.

`mobile-hero-copy.css` legfeljebb 760 px szélességnél működik. A szöveg 62 px-nél kezdődik; a kártyacsokor 128 px-nél. A rendelkezésre álló kártyaterület 66 px-rel csökken, a sorok és a kártyák magassága a meglévő térköz-rendszerből számolódik. A kártyák szélessége, döntése, képfókusza és típusa változatlan. A ház továbbra is 104% vászonszélességű, eredeti képarányú; alsó helye megegyezik a korábbival. Nincs JavaScript- vagy kameraútvonal-változtatás. A kis viewportmagasság továbbra is CSS `svh`, a Safari címsor nem indít utólagos újraillesztést.

Ellenőrzés: tényleges iPhone 17 Pro iOS 26.4 Simulator Safari kezdeti képernyőképen a három sor jól látszik. A meglévő sütisáv a ház részét takarja; a Simulator natív vezérléshibája miatt teljes érintéses Safari-tesztet nem állítunk. Kiegészítő Chrome 390×664 és 360×640 képernyőképek: nincs horizontális túlcsordulás, teljes ház látszik, a szöveg és felső kártya nem fedik egymást. Chrome első 32 px-es görgetésnél a kamera mérete 1 marad, visszagörgetve 0 scroll és 1 méret áll vissza. Asztali 1595×902 ellenőrzés: a kizárólag mobilos szabályok nem változtatják meg az asztali kompozíciót.

Képernyőképek a helyi `output/mobile-hero-copy/` könyvtárban. A sütisávot és a hozzájárulás működését nem módosítottuk.
