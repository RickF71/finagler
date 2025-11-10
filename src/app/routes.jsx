// src/app/routes.jsx
import Overview from "../views/Overview/Overview";
import Identities from "../views/Identities";
import NetworkGraph from "../views/NetworkGraph";
import BootstrapOverview from "../views/BootstrapOverview";
import DomainView from "../views/DomainView";
import DomainFileList from "../views/DomainFileList";
import DomainFileEditor from "../views/DomainFileEditor";
import DomainPolicyEditor from "../views/DomainPolicyEditor";

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
};

// Resolve a component safely
export function CurrentView({ view }) {
  const Component = VIEW_MAP[view] || Overview;
  return <Component />;
}
