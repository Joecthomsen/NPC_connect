import TcpSocket from "react-native-tcp-socket";
import userStore from "../stores/userStore";
import socketStore from "../stores/socketStore";
import controllerStore from "../stores/controllerStore";
import { signInControllerService } from "./httpService";

// const SocketStates = {
//     CONNECTED: 'connected',
//     DISCONNECTED: 'disconnected',
//     CONNECTING: 'connecting',
//   };

// let socketState = SocketStates.DISCONNECTED;

// export const setSocketState = (state: string) => {
//     socketState = state;
// }

// export const getSocketState = () => {
//     return socketState;
// }

// Function to update interval based on socket state
// const updateInterval = () => {
//   switch (getSocketState()) {
//     case SocketStates.CONNECTED:
//       clearInterval(intervalId);
//       intervalId = setInterval(handleSocketState, 20000); // Change interval to 10 seconds when connected
//       break;

//     case SocketStates.DISCONNECTED:
//         clearInterval(intervalId);
//         intervalId = setInterval(handleSocketState, 10000); // Reset interval to default value when disconnected or connecting
//         break;

//     case SocketStates.CONNECTING:
//       clearInterval(intervalId);
//       intervalId = setInterval(handleSocketState, 10000); // Reset interval to default value when disconnected or connecting
//       break;
//     default:
//       break;
//   }
// };


// export const handleSocketState = () => {
//     switch (socketState) {
//         case SocketStates.CONNECTED:
//             //updateInterval();
//             getControllerStatus();            
//             break;
//         case SocketStates.DISCONNECTED:
//             //updateInterval();
//             console.log("Socket is disconnected");
//             searchForSocketsOnNetwork();
//             break;
//         case SocketStates.CONNECTING:
//             console.log("Socket is connecting");
//     }
// }

// export const getControllerStatus = () => {
//     socketStore.sockets.forEach(socket => {
//         console.log("Getting controller status for controller with pop-ID: " + socket.popID);
//         socket.client.write("GET_STATE");  
//     })
// }

// Define the initial interval durationr
//let intervalId = setInterval(getControllerStatus, 15000);


// export const getSockets = () => {
//     return sockets;
// }

export const searchForSocketsOnNetwork = () => {
    console.log("Connecting to sockets on network");
    const controllers = controllerStore.getControllers();

    const KEEP_ALIVE_INTERVAL = 15000; // 1 minute

    // Function to send keep-alive ping
    const sendGetStatus = (socket) => {
    socket.write("GET_STATE"); // Send a keep-alive ping message
    };


    controllers.forEach(controller => {
        console.log("controller: ", controller);
        const options = {
            port: 3333,
            host: "NPC_Connect_" + controller.popID + ".local",
            autoReconnect: true,
        };

        try {
            const client = TcpSocket.createConnection(options, () => {
            client.write("Hello server!");
            // Send the initial keep-alive ping
            sendGetStatus(client);
            // Schedule periodic keep-alive pings
            setInterval(() => {
                sendGetStatus(client);
            }, KEEP_ALIVE_INTERVAL);
            });

            // Add event listeners for incoming data
            client.on('data', async (data) => {
                console.log("DATA:", data.toString())
                const jsonData = JSON.parse(data.toString());

                if(jsonData.status === "Not authenticated state") {
                    console.log("AUTHENTICATION ERROR. Solving...")
                    const response = await signInControllerService(jsonData.popID);
                    console.log("response: ", response);
                    if(response.statusCode === 200){
                        client.write("SET_REFRESH_TOKEN " + response.message.refreshToken);
                    }
                }
            });

            client.on("error", (error) => {
                console.log("Connection error:", error);
            });

            client.on("connect", () => {
                console.log("Connected to controller");
                socketStore.addSocket({"popID": controller.popID, "client": client});
                //setSocketState(SocketStates.CONNECTED);
            });

            client.on("close", () => {
                console.log("Connection closed");
                socketStore.sockets = socketStore.sockets.filter(socket => socket.popID !== controller.popID);
                // if(socketStore.sockets.length === 0 ){
                //     setSocketState(SocketStates.DISCONNECTED)
                // }
            });
        } catch (error) {
            console.log("Error connecting to socket:", error);
            // Handle error as per your requirement
        }
    });

}

export const connectToSocketOnNetwork = (popID: string) => {

    console.log("Connecting to sockets on network");

    const controllers = controllerStore.getControllers();

        console.log("controller: ", popID);
        const options = {
            port: 3333,
            host: "NPC_Connect_" + popID + ".local",
            //reuseAddress: true,
            autoReconnect: true,
        };

        const client = TcpSocket.createConnection(options, () => {
            client.write("Hello server!");
        });
        socketStore.addSocket({"popID": popID, "client": client});
        //sockets.push({"popID": popID, "client": client})
        //Implement if socket exists, dont add
               
        // Add event listeners for incoming data
        client.on('data', async (data) => {

            console.log("DATA:", data.toString())
            const jsonData = JSON.parse(data.toString());

            if(jsonData.status === "Not authenticated state")
            {
                console.log("AUTHENTICATION ERROR. Solving...")
                const response = await signInControllerService(jsonData.popID);
                console.log("response: ", response);
                if(response.statusCode === 200){
                    client.write("SET_REFRESH_TOKEN " + response.message.refreshToken);
                    //console.log("AUTHENTICATION SUCCESSFUL");
                }
            }
        });

        client.on("error", (error) => {
            console.log("Connection error:", error);
        });

        client.on("connect", () => {
            console.log("Connected to controller");
        })

        client.on("close", () => {
            console.log("Connection closed");
        });        
}


export const sendMessageToSocketOnNetwork = (popID: string, message: string) => {

    const socket = socketStore.sockets.find(socket => socket.popID === popID);
    console.log("socket: ", socket)

    if (socket && socket.client && socket.client) {
        socket.client.write(message)
    }
}

//Virker
export const sendTestMessage = (popID: string) => {

    console.log("sendTestMessage socket lenght: ", socketStore.sockets.length)

    socketStore.sockets.forEach(socket => {
        if(socket.popID === popID){
            console.log("socket found")
            socket.client.write("Hello server, this is a test!");
        }
        else{
            console.log("socket not found")
        }
    })
}