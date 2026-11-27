import { Config } from '@remotion/cli/config';

Config.setRspack(true);
Config.setVideoImageFormat('jpeg');
Config.setJpegQuality(92);
Config.setOverwriteOutput(true);
// Este PC suele tener poca RAM libre: pocos cuadros en paralelo.
Config.setConcurrency(2);
