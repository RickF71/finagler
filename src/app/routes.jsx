// src/app/routes.jsx
import Overview from "../views/Overview/Overview";
import Identities from "../views/Identities";
import NetworkGraph from "../views/NetworkGraph";
import BootstrapOverview from "../views/BootstrapOverview";
import DomainView from "../views/DomainView";
import DomainFileList from "../views/DomainFileList";
import DomainFileEditor from "../views/DomainFileEditor";
import DomainPolicyEditor from "../views/DomainPolicyEditor";
import RegoEditor from "../views/RegoEditor";
// GOV-11E: Identity projection views
import IdentityOverview from "../routes/identity/IdentityOverview";
import DomainIdentityView from "../routes/identity/DomainIdentityView";
import CorporealAuthLog from "../routes/identity/CorporealAuthLog";
// GOV-11F: Identity policy viewer
import IdentityPolicyView from "../views/IdentityPolicyView";

// Map simple view keys → components
const VIEW_MAP = {
  overview: Overview,
  identities: Identities,
  network: NetworkGraph,
  bootstrap: BootstrapOverview,
  domainView: DomainView,
  files: DomainFileList,
  editor: DomainFileEditor,
  policy: DomainPolicyEditor,
  rego: RegoEditor,
  // GOV-11E identity views
  identity: IdentityOverview,
  'identity-domain': DomainIdentityView,
  'identity-corporeal': CorporealAuthLog,
  // GOV-11F identity policy viewer
  'identity-policy': IdentityPolicyView,
};

// Resolve a component safely
export function CurrentView({ view }) {
  const Component = VIEW_MAP[view] || Overview;
  return <Component />;
}
