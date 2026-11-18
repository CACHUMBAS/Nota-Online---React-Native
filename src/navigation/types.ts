/** Las rutas reciben identificadores, no objetos completos: el estado real siempre se pide al servidor. */
export type RootStackParamList = {
  Setup: undefined;
  Home: undefined;
  TeacherLogin: undefined;
  TeacherSessions: undefined;
  TeacherRoom: { classroomId: string };
  StudentJoin: undefined;
  StudentRoom: { classroomId: string };
};
