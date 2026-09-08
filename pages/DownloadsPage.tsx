import React from 'react';
import DownloadsLibrary from '../components/downloads/DownloadsLibrary';
import { DOWNLOAD_RESOURCES } from '../components/downloads/downloadsModel';
import './DownloadsPage.css';

const DownloadsPage: React.FC = () => <DownloadsLibrary resources={DOWNLOAD_RESOURCES} />;

export default DownloadsPage;
