import * as migration_20251206_223322 from './20251206_223322';
import * as migration_20251207_190558 from './20251207_190558';
import * as migration_20260421_145138 from './20260421_145138';
import * as migration_20260430_132006 from './20260430_132006';
import * as migration_20260430_141755 from './20260430_141755';
import * as migration_20260430_180000 from './20260430_180000';
import * as migration_20260509_001947 from './20260509_001947';
import * as migration_20260511_151503 from './20260511_151503';
import * as migration_20260511_191324 from './20260511_191324';
import * as migration_20260511_202956 from './20260511_202956';
import * as migration_20260515_192614 from './20260515_192614';

export const migrations = [
  {
    up: migration_20251206_223322.up,
    down: migration_20251206_223322.down,
    name: '20251206_223322',
  },
  {
    up: migration_20251207_190558.up,
    down: migration_20251207_190558.down,
    name: '20251207_190558',
  },
  {
    up: migration_20260421_145138.up,
    down: migration_20260421_145138.down,
    name: '20260421_145138',
  },
  {
    up: migration_20260430_132006.up,
    down: migration_20260430_132006.down,
    name: '20260430_132006',
  },
  {
    up: migration_20260430_141755.up,
    down: migration_20260430_141755.down,
    name: '20260430_141755',
  },
  {
    up: migration_20260430_180000.up,
    down: migration_20260430_180000.down,
    name: '20260430_180000',
  },
  {
    up: migration_20260509_001947.up,
    down: migration_20260509_001947.down,
    name: '20260509_001947',
  },
  {
    up: migration_20260511_151503.up,
    down: migration_20260511_151503.down,
    name: '20260511_151503',
  },
  {
    up: migration_20260511_191324.up,
    down: migration_20260511_191324.down,
    name: '20260511_191324',
  },
  {
    up: migration_20260511_202956.up,
    down: migration_20260511_202956.down,
    name: '20260511_202956',
  },
  {
    up: migration_20260515_192614.up,
    down: migration_20260515_192614.down,
    name: '20260515_192614'
  },
];
