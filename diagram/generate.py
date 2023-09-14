from diagrams import Cluster, Diagram
from diagrams.k8s.compute import Deployment, Pod
from diagrams.k8s.network import Ingress
from diagrams.generic.database import SQL

with Diagram("Shorty", show=False):
    ingress = Ingress("antonhagser.se")

    with Cluster("Services"):
        svc_group = [Pod("shorty-1"),
                     Pod("shorty-2"),
                     Pod("shorty-3")]

    with Cluster("DB Cluster"):
        db_primary = SQL("shorty-db-primary")
        
    ingress >> svc_group >> db_primary
