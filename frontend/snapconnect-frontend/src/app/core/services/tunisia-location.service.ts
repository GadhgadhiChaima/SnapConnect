import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError, startWith } from 'rxjs/operators';

export interface TunisianCity {
  city: string;
  governorate: string;
  display: string;
}

@Injectable({
  providedIn: 'root'
})
export class TunisiaLocationService {
  private http = inject(HttpClient);

  // ── Base de données géographique complète des 24 gouvernorats de Tunisie ──
  private readonly tunisianCities: { city: string; governorate: string }[] = [
    // 1. Tunis
    { city: 'Tunis', governorate: 'Tunis' },
    { city: 'La Marsa', governorate: 'Tunis' },
    { city: 'Carthage', governorate: 'Tunis' },
    { city: 'Sidi Bou Saïd', governorate: 'Tunis' },
    { city: 'Le Kram', governorate: 'Tunis' },
    { city: 'La Goulette', governorate: 'Tunis' },
    { city: 'Les Berges du Lac 1', governorate: 'Tunis' },
    { city: 'Les Berges du Lac 2', governorate: 'Tunis' },
    { city: 'Le Bardo', governorate: 'Tunis' },
    { city: 'El Menzah', governorate: 'Tunis' },
    { city: 'El Manar', governorate: 'Tunis' },
    { city: 'Mutuelleville', governorate: 'Tunis' },
    { city: 'Belvédère', governorate: 'Tunis' },
    { city: 'Montplaisir', governorate: 'Tunis' },
    { city: 'Centre Urbain Nord', governorate: 'Tunis' },
    { city: 'El Omrane', governorate: 'Tunis' },
    { city: 'El Omrane Supérieur', governorate: 'Tunis' },
    { city: 'Cité El Khadra', governorate: 'Tunis' },
    { city: 'Bab Bhar', governorate: 'Tunis' },
    { city: 'Bab Souika', governorate: 'Tunis' },
    { city: 'El Ouardia', governorate: 'Tunis' },
    { city: 'El Kabaria', governorate: 'Tunis' },
    { city: 'Séjoumi', governorate: 'Tunis' },
    { city: 'Djebel Jelloud', governorate: 'Tunis' },

    // 2. Ariana
    { city: 'Ariana', governorate: 'Ariana' },
    { city: 'La Soukra', governorate: 'Ariana' },
    { city: 'Chotrana', governorate: 'Ariana' },
    { city: 'Ennasr 1', governorate: 'Ariana' },
    { city: 'Ennasr 2', governorate: 'Ariana' },
    { city: 'Menzah 5', governorate: 'Ariana' },
    { city: 'Menzah 6', governorate: 'Ariana' },
    { city: 'Menzah 7', governorate: 'Ariana' },
    { city: 'Menzah 8', governorate: 'Ariana' },
    { city: 'Menzah 9', governorate: 'Ariana' },
    { city: 'Raoued', governorate: 'Ariana' },
    { city: 'Gammarth', governorate: 'Ariana' },
    { city: 'Riadh El Andalous', governorate: 'Ariana' },
    { city: 'Ariana Essoughra', governorate: 'Ariana' },
    { city: 'Kalaat el-Andalous', governorate: 'Ariana' },
    { city: 'Sidi Thabet', governorate: 'Ariana' },
    { city: 'Ettadhamen', governorate: 'Ariana' },
    { city: 'Mnihla', governorate: 'Ariana' },
    { city: 'Borj Louzir', governorate: 'Ariana' },

    // 3. Ben Arous
    { city: 'Ben Arous', governorate: 'Ben Arous' },
    { city: 'Radès', governorate: 'Ben Arous' },
    { city: 'Mégrine', governorate: 'Ben Arous' },
    { city: 'Hammam Lif', governorate: 'Ben Arous' },
    { city: 'Hammam Chott', governorate: 'Ben Arous' },
    { city: 'Ezzahra', governorate: 'Ben Arous' },
    { city: 'Bou Mhel', governorate: 'Ben Arous' },
    { city: 'El Mourouj', governorate: 'Ben Arous' },
    { city: 'Mornag', governorate: 'Ben Arous' },
    { city: 'Fouchana', governorate: 'Ben Arous' },
    { city: 'Mohamedia', governorate: 'Ben Arous' },
    { city: 'Borj Cédria', governorate: 'Ben Arous' },
    { city: 'Bir El Bey', governorate: 'Ben Arous' },
    { city: 'Nouvelle Médina', governorate: 'Ben Arous' },

    // 4. Manouba
    { city: 'Manouba', governorate: 'Manouba' },
    { city: 'Den Den', governorate: 'Manouba' },
    { city: 'Douar Hicher', governorate: 'Manouba' },
    { city: 'Oued Ellil', governorate: 'Manouba' },
    { city: 'Mornaguia', governorate: 'Manouba' },
    { city: 'Borj El Amri', governorate: 'Manouba' },
    { city: 'Tebourba', governorate: 'Manouba' },
    { city: 'El Batan', governorate: 'Manouba' },
    { city: 'Djedeida', governorate: 'Manouba' },

    // 5. Nabeul
    { city: 'Nabeul', governorate: 'Nabeul' },
    { city: 'Hammamet', governorate: 'Nabeul' },
    { city: 'Yasmine Hammamet', governorate: 'Nabeul' },
    { city: 'Kelibia', governorate: 'Nabeul' },
    { city: 'Korba', governorate: 'Nabeul' },
    { city: 'Grombalia', governorate: 'Nabeul' },
    { city: 'Soliman', governorate: 'Nabeul' },
    { city: 'Menzel Temime', governorate: 'Nabeul' },
    { city: 'Dar Chaabane El Fehri', governorate: 'Nabeul' },
    { city: 'Beni Khiar', governorate: 'Nabeul' },
    { city: 'El Haouaria', governorate: 'Nabeul' },
    { city: 'Beni Khalled', governorate: 'Nabeul' },
    { city: 'Menzel Bouzelfa', governorate: 'Nabeul' },
    { city: 'Takelsa', governorate: 'Nabeul' },
    { city: 'Bou Argoub', governorate: 'Nabeul' },
    { city: 'Tazarka', governorate: 'Nabeul' },
    { city: 'Hammam Ghezèze', governorate: 'Nabeul' },
    { city: 'El Mida', governorate: 'Nabeul' },
    { city: 'Azmour', governorate: 'Nabeul' },

    // 6. Sousse
    { city: 'Sousse', governorate: 'Sousse' },
    { city: 'Port El Kantaoui', governorate: 'Sousse' },
    { city: 'Hammam Sousse', governorate: 'Sousse' },
    { city: 'Sahloul', governorate: 'Sousse' },
    { city: 'Khezama', governorate: 'Sousse' },
    { city: 'Msaken', governorate: 'Sousse' },
    { city: 'Kalâa Kebira', governorate: 'Sousse' },
    { city: 'Kalâa Seghira', governorate: 'Sousse' },
    { city: 'Akouda', governorate: 'Sousse' },
    { city: 'Enfidha', governorate: 'Sousse' },
    { city: 'Bouficha', governorate: 'Sousse' },
    { city: 'Sidi Bou Ali', governorate: 'Sousse' },
    { city: 'Hergla', governorate: 'Sousse' },
    { city: 'Kondar', governorate: 'Sousse' },
    { city: 'Sidi El Hani', governorate: 'Sousse' },

    // 7. Monastir
    { city: 'Monastir', governorate: 'Monastir' },
    { city: 'Skanes', governorate: 'Monastir' },
    { city: 'Sahline', governorate: 'Monastir' },
    { city: 'Ksar Hellal', governorate: 'Monastir' },
    { city: 'Moknine', governorate: 'Monastir' },
    { city: 'Teboulba', governorate: 'Monastir' },
    { city: 'Jemmal', governorate: 'Monastir' },
    { city: 'Bekalta', governorate: 'Monastir' },
    { city: 'Sayada', governorate: 'Monastir' },
    { city: 'Lamta', governorate: 'Monastir' },
    { city: 'Bouhjar', governorate: 'Monastir' },
    { city: 'Ksibet el-Médiouni', governorate: 'Monastir' },
    { city: 'Zeramdine', governorate: 'Monastir' },
    { city: 'Beni Hassen', governorate: 'Monastir' },
    { city: 'Ouerdanine', governorate: 'Monastir' },
    { city: 'Touza', governorate: 'Monastir' },

    // 8. Sfax
    { city: 'Sfax', governorate: 'Sfax' },
    { city: 'Sfax El Jadida', governorate: 'Sfax' },
    { city: 'Sakiet Ezzit', governorate: 'Sfax' },
    { city: 'Sakiet Eddaïer', governorate: 'Sfax' },
    { city: 'Route de Téniour', governorate: 'Sfax' },
    { city: 'Route de Tunis', governorate: 'Sfax' },
    { city: 'Route de Lafrane', governorate: 'Sfax' },
    { city: 'Route de Gremda', governorate: 'Sfax' },
    { city: 'Route de l\'Aéroport', governorate: 'Sfax' },
    { city: 'Thyna', governorate: 'Sfax' },
    { city: 'Agareb', governorate: 'Sfax' },
    { city: 'Mahres', governorate: 'Sfax' },
    { city: 'Kerkennah', governorate: 'Sfax' },
    { city: 'Menzel Chaker', governorate: 'Sfax' },
    { city: 'Skhira', governorate: 'Sfax' },
    { city: 'Bir Ali Ben Khalifa', governorate: 'Sfax' },
    { city: 'Jbeniana', governorate: 'Sfax' },
    { city: 'El Hencha', governorate: 'Sfax' },
    { city: 'Graïba', governorate: 'Sfax' },

    // 9. Bizerte
    { city: 'Bizerte', governorate: 'Bizerte' },
    { city: 'Bizerte Nord', governorate: 'Bizerte' },
    { city: 'Zarzouna', governorate: 'Bizerte' },
    { city: 'Menzel Bourguiba', governorate: 'Bizerte' },
    { city: 'Mateur', governorate: 'Bizerte' },
    { city: 'Ras Jebel', governorate: 'Bizerte' },
    { city: 'Ghar El Melh', governorate: 'Bizerte' },
    { city: 'Raf Raf', governorate: 'Bizerte' },
    { city: 'Menzel Jemil', governorate: 'Bizerte' },
    { city: 'Tinja', governorate: 'Bizerte' },
    { city: 'Sejnane', governorate: 'Bizerte' },
    { city: 'Joumine', governorate: 'Bizerte' },
    { city: 'Ghezala', governorate: 'Bizerte' },
    { city: 'Utique', governorate: 'Bizerte' },
    { city: 'El Alia', governorate: 'Bizerte' },

    // 10. Jendouba
    { city: 'Jendouba', governorate: 'Jendouba' },
    { city: 'Tabarka', governorate: 'Jendouba' },
    { city: 'Ain Draham', governorate: 'Jendouba' },
    { city: 'Fernana', governorate: 'Jendouba' },
    { city: 'Ghardimaou', governorate: 'Jendouba' },
    { city: 'Boussalem', governorate: 'Jendouba' },
    { city: 'Balta-Bou Aouane', governorate: 'Jendouba' },
    { city: 'Oued Meliz', governorate: 'Jendouba' },
    { city: 'Beni M\'Tir', governorate: 'Jendouba' },

    // 11. Béja
    { city: 'Béja', governorate: 'Béja' },
    { city: 'Medjez el-Bab', governorate: 'Béja' },
    { city: 'Testour', governorate: 'Béja' },
    { city: 'Nefza', governorate: 'Béja' },
    { city: 'Teboursouk', governorate: 'Béja' },
    { city: 'Thibar', governorate: 'Béja' },
    { city: 'Goubellat', governorate: 'Béja' },
    { city: 'Amdoun', governorate: 'Béja' },

    // 12. Zaghouan
    { city: 'Zaghouan', governorate: 'Zaghouan' },
    { city: 'El Fahs', governorate: 'Zaghouan' },
    { city: 'Zriba', governorate: 'Zaghouan' },
    { city: 'Bir Mcherga', governorate: 'Zaghouan' },
    { city: 'Nadhour', governorate: 'Zaghouan' },
    { city: 'Saouaf', governorate: 'Zaghouan' },
    { city: 'Djebel Oust', governorate: 'Zaghouan' },
    { city: 'Moghrane', governorate: 'Zaghouan' },

    // 13. Le Kef
    { city: 'Le Kef', governorate: 'Le Kef' },
    { city: 'Dahmani', governorate: 'Le Kef' },
    { city: 'Tajerouine', governorate: 'Le Kef' },
    { city: 'Kalaat Senan', governorate: 'Le Kef' },
    { city: 'Sakiet Sidi Youssef', governorate: 'Le Kef' },
    { city: 'Sers', governorate: 'Le Kef' },
    { city: 'El Ksour', governorate: 'Le Kef' },
    { city: 'Touiref', governorate: 'Le Kef' },
    { city: 'Nebeur', governorate: 'Le Kef' },
    { city: 'Kalaat Khasba', governorate: 'Le Kef' },
    { city: 'Jérissa', governorate: 'Le Kef' },

    // 14. Siliana
    { city: 'Siliana', governorate: 'Siliana' },
    { city: 'Makthar', governorate: 'Siliana' },
    { city: 'Bou Arada', governorate: 'Siliana' },
    { city: 'Gaâfour', governorate: 'Siliana' },
    { city: 'El Krib', governorate: 'Siliana' },
    { city: 'Rouhia', governorate: 'Siliana' },
    { city: 'Bargou', governorate: 'Siliana' },
    { city: 'Kesra', governorate: 'Siliana' },
    { city: 'Sidi Bou Rouis', governorate: 'Siliana' },
    { city: 'El Aroussa', governorate: 'Siliana' },

    // 15. Mahdia
    { city: 'Mahdia', governorate: 'Mahdia' },
    { city: 'Ksour Essef', governorate: 'Mahdia' },
    { city: 'El Jem', governorate: 'Mahdia' },
    { city: 'Chebba', governorate: 'Mahdia' },
    { city: 'Melloulèche', governorate: 'Mahdia' },
    { city: 'Bou Merdes', governorate: 'Mahdia' },
    { city: 'Salakta', governorate: 'Mahdia' },
    { city: 'Sidi Alouane', governorate: 'Mahdia' },
    { city: 'Essouassi', governorate: 'Mahdia' },
    { city: 'Hebira', governorate: 'Mahdia' },
    { city: 'Ouled Chamekh', governorate: 'Mahdia' },
    { city: 'Rejiche', governorate: 'Mahdia' },

    // 16. Kairouan
    { city: 'Kairouan', governorate: 'Kairouan' },
    { city: 'Sbikha', governorate: 'Kairouan' },
    { city: 'Oueslatia', governorate: 'Kairouan' },
    { city: 'Haffouz', governorate: 'Kairouan' },
    { city: 'Nasrallah', governorate: 'Kairouan' },
    { city: 'Bou Hajla', governorate: 'Kairouan' },
    { city: 'Chebika', governorate: 'Kairouan' },
    { city: 'El Alâa', governorate: 'Kairouan' },
    { city: 'Hajeb El Ayoun', governorate: 'Kairouan' },
    { city: 'Echrarda', governorate: 'Kairouan' },

    // 17. Kasserine
    { city: 'Kasserine', governorate: 'Kasserine' },
    { city: 'Sbeïtla', governorate: 'Kasserine' },
    { city: 'Feriana', governorate: 'Kasserine' },
    { city: 'Thala', governorate: 'Kasserine' },
    { city: 'Foussana', governorate: 'Kasserine' },
    { city: 'Haïdra', governorate: 'Kasserine' },
    { city: 'Thélepte', governorate: 'Kasserine' },
    { city: 'Majel Bel Abbès', governorate: 'Kasserine' },
    { city: 'Jedelienne', governorate: 'Kasserine' },
    { city: 'Hassi El Ferid', governorate: 'Kasserine' },

    // 18. Sidi Bouzid
    { city: 'Sidi Bouzid', governorate: 'Sidi Bouzid' },
    { city: 'Regueb', governorate: 'Sidi Bouzid' },
    { city: 'Jilma', governorate: 'Sidi Bouzid' },
    { city: 'Menzel Bouzaiane', governorate: 'Sidi Bouzid' },
    { city: 'Bir El Hafey', governorate: 'Sidi Bouzid' },
    { city: 'Meknassy', governorate: 'Sidi Bouzid' },
    { city: 'Sidi Ali Ben Aoun', governorate: 'Sidi Bouzid' },
    { city: 'Souk Jedid', governorate: 'Sidi Bouzid' },
    { city: 'Ouled Haffouz', governorate: 'Sidi Bouzid' },
    { city: 'Cebbala Ouled Asker', governorate: 'Sidi Bouzid' },

    // 19. Gabès
    { city: 'Gabès', governorate: 'Gabès' },
    { city: 'Chenini Nahal', governorate: 'Gabès' },
    { city: 'Matmata', governorate: 'Gabès' },
    { city: 'Nouvelle Matmata', governorate: 'Gabès' },
    { city: 'Mareth', governorate: 'Gabès' },
    { city: 'Ghannouch', governorate: 'Gabès' },
    { city: 'Métouia', governorate: 'Gabès' },
    { city: 'El Hamma', governorate: 'Gabès' },
    { city: 'Menzel El Habib', governorate: 'Gabès' },

    // 20. Médenine
    { city: 'Médenine', governorate: 'Médenine' },
    { city: 'Djerba Houmt Souk', governorate: 'Médenine' },
    { city: 'Djerba Midoun', governorate: 'Médenine' },
    { city: 'Djerba Ajim', governorate: 'Médenine' },
    { city: 'Zarzis', governorate: 'Médenine' },
    { city: 'Ben Gardane', governorate: 'Médenine' },
    { city: 'Beni Khedache', governorate: 'Médenine' },
    { city: 'Sidi Makhlouf', governorate: 'Médenine' },

    // 21. Tataouine
    { city: 'Tataouine', governorate: 'Tataouine' },
    { city: 'Ghomrassen', governorate: 'Tataouine' },
    { city: 'Remada', governorate: 'Tataouine' },
    { city: 'Smâr', governorate: 'Tataouine' },
    { city: 'Bir Lahmar', governorate: 'Tataouine' },
    { city: 'Dehiba', governorate: 'Tataouine' },
    { city: 'Chenini', governorate: 'Tataouine' },

    // 22. Gafsa
    { city: 'Gafsa', governorate: 'Gafsa' },
    { city: 'Métlaoui', governorate: 'Gafsa' },
    { city: 'Redeyef', governorate: 'Gafsa' },
    { city: 'Moularès', governorate: 'Gafsa' },
    { city: 'El Guettar', governorate: 'Gafsa' },
    { city: 'Mdhilla', governorate: 'Gafsa' },
    { city: 'El Ksar', governorate: 'Gafsa' },
    { city: 'Sened', governorate: 'Gafsa' },
    { city: 'Sidi Aïch', governorate: 'Gafsa' },

    // 23. Tozeur
    { city: 'Tozeur', governorate: 'Tozeur' },
    { city: 'Nefta', governorate: 'Tozeur' },
    { city: 'Degache', governorate: 'Tozeur' },
    { city: 'Tameghza', governorate: 'Tozeur' },
    { city: 'Hazoua', governorate: 'Tozeur' },
    { city: 'El Hamma du Jérid', governorate: 'Tozeur' },

    // 24. Kébili
    { city: 'Kébili', governorate: 'Kébili' },
    { city: 'Douz', governorate: 'Kébili' },
    { city: 'Souk Lahad', governorate: 'Kébili' },
    { city: 'El Golâa', governorate: 'Kébili' },
    { city: 'Faouar', governorate: 'Kébili' },
    { city: 'Jemna', governorate: 'Kébili' }
  ];

  /**
   * Recherche instantanée parmi les villes tunisiennes, avec enrichissement Nominatim (strictement Tunisie)
   */
  search(query: string): Observable<TunisianCity[]> {
    const raw = (query || '').trim();
    if (!raw || raw.length < 2) {
      return of([]);
    }

    const q = this.normalize(raw);

    // 1. Recherche dans le dictionnaire local certifié
    const localMatches = this.tunisianCities.filter(item => {
      const c = this.normalize(item.city);
      const g = this.normalize(item.governorate);
      return c.includes(q) || g.includes(q);
    });

    // Classement : ville commençant par la recherche > gouvernorat > contient
    localMatches.sort((a, b) => {
      const ac = this.normalize(a.city);
      const bc = this.normalize(b.city);
      const aStarts = ac.startsWith(q);
      const bStarts = bc.startsWith(q);
      if (aStarts && !bStarts) return -1;
      if (!aStarts && bStarts) return 1;
      return a.city.localeCompare(b.city);
    });

    const localResults: TunisianCity[] = localMatches.slice(0, 8).map(i => {
      const isGovSame = i.city.toLowerCase() === i.governorate.toLowerCase();
      return {
        city: i.city,
        governorate: i.governorate,
        display: isGovSame ? `${i.city}, Tunisie` : `${i.city}, ${i.governorate}`
      };
    });

    // Si on a une correspondance locale commençant par la recherche (ex: "jendou" -> "Jendouba"),
    // on interroge l'API Nominatim avec ce nom certifié en Tunisie, sinon avec le terme saisi.
    const apiQuery = (localMatches.length > 0 && this.normalize(localMatches[0].city).startsWith(q))
      ? localMatches[0].city
      : raw;

    const nominatimUrl = `https://nominatim.openstreetmap.org/search?q=${encodeURIComponent(apiQuery)}&countrycodes=tn&format=json&addressdetails=1&limit=5&accept-language=fr`;

    return this.http.get<any[]>(nominatimUrl, {
      headers: { 'Accept-Language': 'fr' }
    }).pipe(
      map(items => {
        const nominatimResults: TunisianCity[] = [];
        if (Array.isArray(items)) {
          for (const item of items) {
            const addr = item.address || {};
            let cityName = addr.city || addr.town || addr.village || addr.municipality || addr.suburb || item.name || '';
            cityName = cityName
              .replace(/^Gouvernorat\s+(de\s+|d')?/i, '')
              .replace(/Governorate/i, '')
              .trim();

            let govName = addr.state || addr.county || '';
            govName = govName
              .replace(/^Gouvernorat\s+(de\s+|d')?/i, '')
              .replace(/Governorate/i, '')
              .trim();

            if (cityName) {
              const isGovSame = !govName || govName.toLowerCase() === cityName.toLowerCase() || govName.toLowerCase() === 'tunisie';
              const cleanedGov = isGovSame ? 'Tunisie' : govName;
              const display = isGovSame ? `${cityName}, Tunisie` : `${cityName}, ${cleanedGov}`;
              nominatimResults.push({
                city: cityName,
                governorate: cleanedGov,
                display
              });
            }
          }
        }

        // Fusionner et dédupliquer par `display`
        const seen = new Set<string>();
        const combined: TunisianCity[] = [];

        for (const item of [...localResults, ...nominatimResults]) {
          const key = this.normalize(item.display);
          if (!seen.has(key)) {
            seen.add(key);
            combined.push(item);
          }
        }

        return combined.slice(0, 8);
      }),
      catchError(() => of(localResults)),
      startWith(localResults)
    );
  }

  /**
   * Normalisation sans accents et en minuscules pour comparaisons fluides
   */
  private normalize(str: string): string {
    return (str || '')
      .toLowerCase()
      .normalize('NFD')
      .replace(/[\u0300-\u036f]/g, '')
      .trim();
  }
}
