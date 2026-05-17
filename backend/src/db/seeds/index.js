import { seed as seedRoles }             from './001_roles.js';
import { seed as seedCategories }        from './002_categories.js';
import { seed as seedResources }         from './003_resources.js';
import { seed as seedSettings }          from './004_settings.js';
import { seed as seedMonitoringTargets } from './005_monitoring_targets.js';

export function runSeeds(db) {
  const run = db.transaction(() => {
    seedRoles(db);
    seedCategories(db);
    seedResources(db);
    seedSettings(db);
    seedMonitoringTargets(db);
  });
  run();
}
