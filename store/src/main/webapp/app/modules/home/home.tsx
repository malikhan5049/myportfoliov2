import './home.scss';

import React, { useEffect } from 'react';
import { Alert, Col, Row } from 'react-bootstrap';
import { Translate } from 'react-jhipster';
import { useLocation, useNavigate } from 'react-router';

import { useAppSelector } from 'app/config/store';
import { REDIRECT_URL, getLoginUrl } from 'app/shared/util/url-utils';

export const Home = () => {
  const account = useAppSelector(state => state.authentication.account);
  const pageLocation = useLocation();
  const navigate = useNavigate();

  useEffect(() => {
    const redirectURL = localStorage.getItem(REDIRECT_URL);
    if (redirectURL) {
      localStorage.removeItem(REDIRECT_URL);
      location.href = `${location.origin}${redirectURL}`;
    }
  });

  return (
    <Row>
      <Col md="3" className="pad">
        <span className="hero rounded" />
      </Col>
      <Col md="9">
        <h1 className="display-4">
          <Translate contentKey="home.title">Welcome to My App Store</Translate>
        </h1>
        <p className="lead">
          <Translate contentKey="home.subtitle">Your applications in one place</Translate>
        </p>
        {account?.login ? (
          <div>
            <Alert variant="success">
              <Translate contentKey="home.logged.message" interpolate={{ username: account.login }}>
                You are logged in as user {account.login}.
              </Translate>
            </Alert>
          </div>
        ) : (
          <div>
            <Alert variant="warning">
              <Translate contentKey="global.messages.info.authenticated.prefix">If you want to </Translate>

              <a
                className="alert-link"
                onClick={() =>
                  navigate(getLoginUrl(), {
                    state: { from: pageLocation },
                  })
                }
              >
                <Translate contentKey="global.messages.info.authenticated.link">sign in</Translate>
              </a>
              <Translate contentKey="global.messages.info.authenticated.suffix">
                , you can try the default accounts:
                <br />- Administrator (login=&quot;admin&quot; and password=&quot;admin&quot;)
                <br />- User (login=&quot;user&quot; and password=&quot;user&quot;).
              </Translate>
            </Alert>
          </div>
        )}
        <p>
          <Translate contentKey="home.intro">Use the navigation above to explore your applications, the blog and your account.</Translate>
        </p>
      </Col>
    </Row>
  );
};

export default Home;
