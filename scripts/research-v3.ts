import {trendHunter} from '../src/services/TrendHunter';
console.log(JSON.stringify(await trendHunter(process.argv[2]||'output/production-v3-2026-11-10'),null,2));
