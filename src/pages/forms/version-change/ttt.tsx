import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import * as JsDiff from 'diff';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import axiosInstance from '../../../api/axiosInstance';
import './VersionComparison.css'; 

interface VersionData {
  firstVersion: any;
  secondVersion: any;
  responses: any;
  pages: Page[];
  project: any;
  form: any;
}

interface Page {
  id: string;
  title: string;
  color: string;
  sections: Section[];
}

interface Section {
  id: string;
  title: string;
  fields: Field[];
}

interface Field {
  id: string;
  title: string;
  oldValue: string;
  newValue: string;
}

const VersionComparison: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [versionData, setVersionData] = useState<VersionData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<string>('');

  useEffect(() => {
    const fetchVersionData = async () => {
      try {
        const v1 = searchParams.get('v1');
        const v2 = searchParams.get('v2');

        if (!v1 || !v2) throw new Error('Version parameters (v1 and v2) are required');

        const response = await axiosInstance.get(`/form/version/compare`, {
          params: { v1, v2 },
        });

        if (!response.data.payload) throw new Error('No version data received');

        const data = response.data.payload;
        setVersionData(data);

        const tabParam = searchParams.get('tab');
        const firstPageId = data.pages?.[0]?.id || '';

        if (tabParam && data.pages?.some((page: Page) => page.id === tabParam)) {
          setActiveTab(tabParam);
        } else if (firstPageId) {
          setActiveTab(firstPageId);
        }
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to fetch version data');
      } finally {
        setLoading(false);
      }
    };

    fetchVersionData();
  }, [id, searchParams]);

  const htmlToPlainText = (html: string) => {
    const tempElement = document.createElement('div');
    tempElement.innerHTML = html;
    return tempElement.textContent || tempElement.innerText || '';
  };

  const getDiffHtml = (oldValue: string, newValue: string, title: string) => {
    const plainOldValue = htmlToPlainText(oldValue || '');
    const plainNewValue = htmlToPlainText(newValue || '');

    if (plainOldValue === plainNewValue) {
      return (
        <div className="no-change-box">
          <strong>No changes for:</strong> {plainOldValue || '—'}
        </div>
      );
    }

    const unifiedDiff = JsDiff.createPatch(title, plainOldValue, plainNewValue, '', '');
    const diffJson = Diff2Html.parse(unifiedDiff);
    return (
      <div
        className="diff-wrapper"
        dangerouslySetInnerHTML={{
          __html: Diff2Html.html(diffJson, {
            drawFileList: false,
            outputFormat: 'side-by-side',
            diffStyle: 'word',
            renderNothingWhenEmpty: false,
          }),
        }}
      />
    );
  };

  if (loading) {
    return <div className="loading">Loading...</div>;
  }

  if (error) {
    return <div className="error-box">{error}</div>;
  }

  if (!versionData) {
    return <div className="info-box">No version data available</div>;
  }

  return (
    <div className="container">
      <div className="header">
        <p className="subtitle">Compare Versions</p>
        <h2 className="title">{versionData.project?.projectName || 'Version Comparison'}</h2>
      </div>

      <div className="tabs">
        {versionData.pages.map((page: Page) => (
          <button
            key={page.id}
            className={`tab-button ${activeTab === page.id ? 'active' : ''}`}
            onClick={() => setActiveTab(page.id)}
          >
            {page.title}
          </button>
        ))}
      </div>

      <div className="tab-content">
        {versionData.pages.map((page: Page) => (
          <div key={page.id} className={`tab-panel ${activeTab === page.id ? 'visible' : ''}`}>
            {page.sections.map((section: Section) => (
              <div key={section.id} className="section">
                <h3 className="section-title">{section.title}</h3>
                <div className="fields">
                  {section.fields.map((field: Field) => (
                    <div key={field.id} className="field">
                      <h4 className="field-title">{field.title}</h4>
                      {getDiffHtml(field.oldValue, field.newValue, field.title)}
                    </div>
                  ))}
                </div>
              </div>
            ))}
          </div>
        ))}
      </div>
    </div>
  );
};

export default VersionComparison;
