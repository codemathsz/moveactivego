import AsyncStorage from "@react-native-async-storage/async-storage";

const STORAGE_KEY = "@moveapp:location";

type RoutesLocationProps = {
    latitude: number
    longitude: number
    timestamp: string
    speed: number
    distance: number
}

type getLocationProps ={
    routes: RoutesLocationProps[]
    routeToSend: RoutesLocationProps[]
    distance: number
    calories: number
    startRunDate: any
}

type saveLocationProps ={
    route: RoutesLocationProps
    routeToSend: RoutesLocationProps
    distance: number
    calories: number
    startRunDate: any
}

export async function getStorageLocation(): Promise<getLocationProps>{
    const storage = await AsyncStorage.getItem(STORAGE_KEY);
    const response = storage ? JSON.parse(storage) : []
    return {
        calories: response.calories ?? 0,
        distance: response.distance ?? 0,
        routes: response.routes ?? [],
        startRunDate: response.startRunDate ?? null,
        routeToSend: response.routeToSend ?? []
    };
}

export async function saveStorageLocation(newLocation:saveLocationProps){
    const storage = await getStorageLocation()

    if (!storage.routes) {
        storage.routes = [];
    }

    storage.calories = newLocation.calories
    storage.distance = newLocation.distance
    storage.startRunDate = newLocation.startRunDate
    storage.routes.push(newLocation.route)
    if (newLocation.routeToSend && newLocation.routeToSend.latitude && newLocation.routeToSend.longitude) {
    storage.routeToSend.push(newLocation.routeToSend);
    }

    await AsyncStorage.setItem(STORAGE_KEY, JSON.stringify(storage))
}

export async function removeStorageLocation(){
    await AsyncStorage.removeItem(STORAGE_KEY)
}