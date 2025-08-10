import {
  MapContainer,
  TileLayer,
  Marker,
  Popup,
  useMap,
} from "react-leaflet";
import L from "leaflet";
import "leaflet/dist/leaflet.css";
import { useEffect, useMemo, useState } from "react";
import {Search,} from "lucide-react";
import { Button } from "../../components/ui/Button";

delete (L.Icon.Default.prototype as any)._getIconUrl;

L.Icon.Default.mergeOptions({
  iconRetinaUrl:
    "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.7.1/dist/images/marker-shadow.png",
});

const createCustomIcon = (color: string) =>
  new L.Icon({
    iconUrl: `https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-${color}.png`,
    shadowUrl:
      "https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png",
    iconSize: [25, 41],
    iconAnchor: [12, 41],
    popupAnchor: [1, -34],
    shadowSize: [41, 41],
  });

const icons = {
  green: createCustomIcon("green"),
  red: createCustomIcon("red"),
  blue: createCustomIcon("blue"),
  gold: createCustomIcon("gold"),
};


interface SiteVisitBrief {
  isVisited: boolean;
  streetAddress: string;
  dateOfVisit: string;
  slug: string;
}

interface Project {
  id: string;
  projectName: string;
  status: string; 
  latitude: number;
  longitude: number;
  address: string;
  visitDate: string;


  isVisited?: boolean;          
  siteVisits?: SiteVisitBrief[];
}


const isProjectVisited = (p: Project): boolean => {
  if (typeof p.isVisited === "boolean") return p.isVisited;
  if (Array.isArray(p.siteVisits) && p.siteVisits.length > 0) {
    return p.siteVisits.some((sv) => sv.isVisited);
  }
  return false;
};


const getIconForProject = (p: Project) =>
  isProjectVisited(p) ? icons.green : icons.red;

function MapController({
  center,
  zoom,
}: {
  center: [number, number];
  zoom: number;
}) {
  const map = useMap();
  useEffect(() => {
    map.setView(center, zoom);
  }, [center, zoom, map]);

  return null;
}

function MapSearch() {
  const [searchQuery, setSearchQuery] = useState("");
  return (
    <div className="absolute top-4 right-4 z-[1000] bg-white p-2 rounded-lg shadow-md">
      <div className="relative">
        <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-gray-400" />
        <input
          type="text"
          placeholder="Search locations…"
          className="pl-10 pr-4 py-2 border rounded-md w-64 focus:outline-none focus:ring-2 focus:ring-blue-500"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
        />
      </div>
    </div>
  );
}


export function ProjectMapView({
  projects,
  onToggleView,
}: {
  projects: Project[];
  onToggleView?: () => void;
}) {
  const [mapCenter] = useState<[number, number]>([39.8283, -98.5795]);
  const [mapZoom] = useState(4);

  const filterSiteVisit= projects.filter((el)=>el.siteVisits.length>0)

  const completedCount = useMemo(
    () => filterSiteVisit.filter(isProjectVisited).length,
    [projects]
  );
  const pendingCount = useMemo(
    () => filterSiteVisit.filter((p) => !isProjectVisited(p)).length,
    [projects]
  );

  if (typeof window === "undefined") return null;

  return (
    <div className="relative h-[80vh] w-full">
      <MapContainer
        center={mapCenter}
        zoom={mapZoom}
        style={{ height: "100%", width: "100%" }}
        zoomControl={false}
      >
        <MapController center={mapCenter} zoom={mapZoom} />

        <TileLayer
          url="https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png"
          attribution='&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        />

        {projects.map((project) => (
          <Marker
            key={project.id}
            position={[project.latitude, project.longitude]}
            icon={getIconForProject(project)}
          >
            <Popup>
              <div className="min-w-[300px] space-y-2">
                <h3 className="font-bold text-lg">{project.projectName}</h3>

                <div className="flex justify-between">
                  <span className="text-sm font-semibold">Status</span>
                  <span
                    className='px-2 py-0.5 text-xs rounded-full bg-blue-600 text-white '
                  >
                    {project.status}
                  </span>
                </div>

                {Array.isArray(project.siteVisits) &&
                  project.siteVisits.map((sv) => (
                    <div key={sv.slug} className="space-y-1">
                      <div>
                        <span className="text-sm font-semibold">Address:</span>{" "}
                        <span className="text-sm">{sv.streetAddress}</span>
                      </div>
                      <div>
                        <span className="text-sm font-semibold">
                          Visit Date:
                        </span>{" "}
                        <span className="text-sm">
                          {new Date(sv.dateOfVisit).toLocaleDateString()}
                        </span>
                      </div>
                    </div>
                  ))}

                <Button
                  size="sm"
                  className="w-full mt-2"
                  onClick={() =>
                    window.open(`/projects/${project.id}`, "_blank")
                  }
                >
                  View Details
                </Button>
              </div>
            </Popup>
          </Marker>
        ))}

        <MapSearch />
      </MapContainer>

      <div className="absolute bottom-4 left-4 z-[1000] bg-white p-3 rounded-lg shadow-md">
        <div className="flex items-center space-x-4">
        <div className="flex items-center space-x-1">
            {/* <div className="w-3 h-3 rounded-full bg-green-600" /> */}
            <span className="text-sm">Live Projects: {projects.length}</span>
          </div>
          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-green-600" />
            <span className="text-sm">SVs Completed: {completedCount}</span>
          </div>

          <div className="flex items-center space-x-1">
            <div className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-sm">Svs Pending: {pendingCount}</span>
          </div>
        </div>
      </div>
    </div>
  );
}
