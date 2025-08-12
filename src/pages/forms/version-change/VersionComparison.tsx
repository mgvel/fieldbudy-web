import React, { useState, useEffect } from 'react';
import { useParams, useSearchParams } from 'react-router-dom';
import * as JsDiff from 'diff';
import * as Diff2Html from 'diff2html';
import 'diff2html/bundles/css/diff2html.min.css';
import axiosInstance from '../../../api/axiosInstance';
import './VersionComparison.css';

import structure from '../../../assets/data/formdata.json'; 

const VersionComparison: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const [searchParams] = useSearchParams();
  const [versionData, setVersionData] = useState<any>(null);
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
        const firstPageId = structure?.[0]?.id || '';

        if (tabParam && structure?.some((page: any) => page.id === tabParam)) {
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

  const fetchImageMetadata = async (ids: string[]) => {
    const promises = ids.map((id) =>
      axiosInstance.get(`/media/${id}`).then((res) => ({
        id,
        thumbnail: res.data?.payload?.media?.thumbnail,
      }))
    );
    return Promise.all(promises);
  };

  const ImageDiff: React.FC<{ value1: string; value2: string }> = ({ value1, value2 }) => {
    const [imagesV1, setImagesV1] = useState<any[]>([]);
    const [imagesV2, setImagesV2] = useState<any[]>([]);

    useEffect(() => {
      const isValidMediaId = (val: string) => val.length === 24 && /^[a-fA-F0-9]+$/.test(val);
      const parseIds = (value: string) => value?.split(',').map((id) => id.trim()).filter(isValidMediaId);

      const ids1 = parseIds(value1);
      const ids2 = parseIds(value2);

      if (ids1.length > 0) fetchImageMetadata(ids1).then(setImagesV1);
      if (ids2.length > 0) fetchImageMetadata(ids2).then(setImagesV2);
    }, [value1, value2]);

    return (
      <div className="image-compare">
        <div className="image-version">
          <strong>Version 1</strong>
          <div className="grid grid-cols-9">
            {imagesV1.map((img) => (
              <img className='w-[100px]' key={img.id} src={img.thumbnail} alt="V1" />
            ))}
          </div>
        </div>
        <div className="image-version">
          <strong>Version 2</strong>
          <div className="grid grid-cols-9">
            {imagesV2.map((img) => (
              <img className='w-[100px]' key={img.id} src={img.thumbnail} alt="V2" />
            ))}
          </div>
        </div>
      </div>
    );
  };

  if (loading) return <div className="loading">Loading...</div>;
  if (error) return <div className="error-box">{error}</div>;
  if (!versionData) return <div className="info-box">No version data available</div>;

  return (
    <div className="container">
      <div className="header">
        <p className="subtitle">Compare Versions</p>
        <h2 className="title">{versionData.project?.projectName || 'Version Comparison'}</h2>
      </div>

      <div className="tabs">
        {structure.map((page: any) => (
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
        {structure.map((page: any) => (
          <div key={page.id} className={`tab-panel ${activeTab === page.id ? 'visible' : ''}`}>
            {page.section.map((section: any) => (
              <div key={section.id} className="section">
                <h3 className="section-title">{section.title}</h3>
                <div className="fields">
                  {section.fields.map((field: any) => {
                    const val1 = versionData.firstVersion?.responses?.[field.id] || '';
                    const val2 = versionData.secondVersion?.responses?.[field.id] || '';
                    return (
                      <div key={field.id} className="field">
                        <h4 className="field-title">{field.title}</h4>
                        {field.fieldType === 'images' ? (
                          <ImageDiff value1={val1} value2={val2} />
                        ) : (
                          getDiffHtml(val1, val2, field.title)
                        )}
                      </div>
                    );
                  })}
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
